# -*- coding: utf-8 -*-

# === 1. 라이브러리 임포트 ===
import os
import re
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import fitz  # PDF 처리를 위한 PyMuPDF
import ollama
import chromadb
from sentence_transformers import SentenceTransformer
import urllib.request
import json
import requests
import time
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


# 네이버 API 인증 정보
CLIENT_ID = "Gsw3EKqttspCGXo8GXUr"
CLIENT_SECRET = "Nd76GbAAKv"

# === 2. Flask 앱 초기화 ===
app = Flask(__name__)
CORS(app)  # Cross-Origin Resource Sharing (CORS) 활성화

# === 3. 설정 변수 ===
# --- 이 스크립트가 위치한 디렉토리의 절대 경로를 가져옵니다
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# --- 리소스의 절대 경로를 설정합니다
PDF_FILE_PATH = os.path.join(BASE_DIR, "job.pdf")
CHROMA_DB_PATH = os.path.join(BASE_DIR, "chroma_db")

# --- 모델 및 RAG 설정
# Ollama에서 사용할 모델을 선택합니다.
MODEL_NAME = "exaone3.5:2.4b"
# ChromaDB 컬렉션의 이름입니다.
CHROMA_COLLECTION_NAME = "pdf_chatbot_collection"
# 임베딩 생성을 위한 Sentence Transformer 모델입니다.
EMBEDDING_MODEL_NAME = "intfloat/multilingual-e5-small"
# 데이터베이스에서 가져올 관련성 높은 청크의 수입니다.
TOP_K_CHUNKS = 3

# === 4. RAG 시스템을 위한 전역 변수 ===
# 서버가 시작될 때 한 번 초기화됩니다.
embedder = None
chroma_collection = None

# === 5. RAG 시스템 핵심 함수 ===

def read_pdf_chunks(file_path, chunk_size=500, overlap=50):
    """
    PDF 파일을 읽고, 텍스트를 추출한 후, 다루기 쉬운 조각(chunk)으로 나눕니다.
    """
    if not os.path.exists(file_path):
        print(f"❌ 오류: '{file_path}' 경로에서 파일을 찾을 수 없습니다.")
        return []
    try:
        doc = fitz.open(file_path)
        full_text = "".join(page.get_text("text") for page in doc)
        doc.close()
        
        if not full_text.strip():
            print("❌ 경고: PDF에서 텍스트를 추출했지만 내용이 비어있습니다.")
            return []

        # 여러 개의 공백 문자를 하나의 공백으로 대체하여 텍스트를 정리합니다
        full_text = re.sub(r'\s+', ' ', full_text).strip()
        
        # 텍스트를 겹치는 부분이 있도록 조각으로 나눕니다
        chunks = [
            full_text[i:i + chunk_size]
            for i in range(0, len(full_text), chunk_size - overlap)
        ]
        return chunks
    except Exception as e:
        print(f"❌ PDF 파일 처리 중 오류 발생: {e}")
        return []

def initialize_rag_system():
    """
    RAG 시스템을 초기화합니다: 임베딩 모델을 로드하고 벡터 데이터베이스를 설정합니다.
    만약 데이터베이스가 비어있으면, PDF를 처리하여 DB를 채웁니다.
    """
    global embedder, chroma_collection
    print("🚀 RAG 시스템 초기화를 시작합니다...")
    try:
        # Sentence Transformer 모델을 로드합니다
        embedder = SentenceTransformer(EMBEDDING_MODEL_NAME)
        print("✅ 임베딩 모델 로드 완료.")

        # 영구 저장되는 ChromaDB 클라이언트를 설정합니다
        client = chromadb.PersistentClient(path=CHROMA_DB_PATH)
        chroma_collection = client.get_or_create_collection(name=CHROMA_COLLECTION_NAME)

        # 데이터베이스가 비어있으면 PDF를 처리합니다
        if chroma_collection.count() == 0:
            print(f"⚠️ 벡터 데이터베이스가 비어있습니다. '{PDF_FILE_PATH}' 파일을 처리합니다...")
            pdf_chunks = read_pdf_chunks(PDF_FILE_PATH)
            
            if not pdf_chunks:
                print(f"❌ PDF 파일을 읽거나 처리하는 데 실패했습니다. RAG 시스템이 정상적으로 작동하지 않을 수 있습니다.")
                return

            # --- ★★★ 청크 내용 확인을 위한 디버깅 코드 ★★★ ---
            print("\n" + "="*20 + " PDF에서 생성된 텍스트 청크 (최대 5개) " + "="*20)
            for i, chunk in enumerate(pdf_chunks[:5]): # 터미널에 너무 많이 표시되지 않도록 최대 5개만 출력
                print(f"--- 청크 {i+1} ---")
                print(chunk)
                print("-" * (len(f"--- 청크 {i+1} ---")))
            if len(pdf_chunks) > 5:
                print(f"...... (총 {len(pdf_chunks)}개의 청크 중 앞 5개만 표시)")
            print("="*67 + "\n")
            # --- ★★★ 디버깅 코드 끝 ★★★ ---

            # 각 조각에 대한 임베딩을 생성합니다
            chunk_embeddings = embedder.encode(pdf_chunks, show_progress_bar=True)
            ids = [str(i) for i in range(len(pdf_chunks))]
            
            # 데이터를 데이터베이스에 추가합니다
            chroma_collection.add(embeddings=chunk_embeddings, documents=pdf_chunks, ids=ids)
            print(f"✅ 데이터베이스에 {len(pdf_chunks)}개의 문서 조각을 저장했습니다.")
        else:
            print(f"✅ 기존 데이터베이스에서 {chroma_collection.count()}개의 임베딩을 로드했습니다.")
            
        print("🎉 RAG 시스템이 준비되었습니다.")
    except Exception as e:
        print(f"❌ RAG 시스템 초기화 중 심각한 오류가 발생했습니다: {e}")

# app.py 파일의 기존 run_ollama_chat 함수를 아래 코드로 전체 교체하세요.

def run_ollama_chat(question, history):
    """
    주요 RAG 로직을 처리합니다: 컨텍스트를 검색하고 답변을 생성합니다.
    """
    if chroma_collection is None:
        return "오류: RAG 시스템이 제대로 초기화되지 않았습니다. 서버 로그를 확인해주세요."
    
    try:
        # 1. ChromaDB에서 관련성 높은 컨텍스트를 검색합니다
        results = chroma_collection.query(query_texts=[question], n_results=TOP_K_CHUNKS)
        
        if not results['documents'] or not results['documents'][0]:
            return "죄송합니다, 주어진 문서에서 질문과 관련된 정보를 찾을 수 없었습니다."

        context = "\n---\n".join(results['documents'][0])

        # 2. 검색된 컨텍스트로 프롬프트를 준비합니다
        system_prompt = (
            "당신은 제공된 문서의 컨텍스트(context)만을 기반으로 질문에 답변하는 지능형 어시스턴트입니다. "
            "답변은 반드시 한국어로 해야 합니다. 'CONTEXT' 섹션에 주어진 정보를 사용하여 사용자의 질문에 간결하고 직접적으로 답변하세요. "
            "만약 컨텍스트에 답변이 포함되어 있지 않다면, 반드시 '주어진 문서 내용으로는 답변할 수 없습니다.'라고 말해야 합니다. "
            "외부 지식을 절대 사용하지 마세요."
        )
        
        prompt_with_context = f"""
[CONTEXT]
{context}

[QUESTION]
{question}
"""
        # 3. Ollama를 사용하여 답변을 생성합니다
        messages = [{"role": "system", "content": system_prompt}]
        messages.extend(history)
        messages.append({"role": "user", "content": prompt_with_context})
        
        # ▼▼▼▼▼ [핵심 수정] 이 부분이 바뀌었습니다! ▼▼▼▼▼
        
        # Ollama 클라이언트를 직접 만들어서 timeout을 60초로 넉넉하게 설정합니다.
        # 이렇게 하면 모델이 로딩되는 시간을 충분히 기다려줄 수 있습니다.
        client = ollama.Client(host='http://localhost:11434', timeout=60)
        response = client.chat(model=MODEL_NAME, messages=messages)
        
        # ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

        answer = response["message"]["content"].strip()
        
        return answer

    except Exception as e:
        print(f"💥 RAG 채팅 실행 중 오류 발생: {e}")
        # 흔한 문제에 대해 도움이 되는 오류 메시지를 제공합니다
        if "model not found" in str(e):
            return f"Ollama 오류: '{MODEL_NAME}' 모델을 찾을 수 없습니다. 'ollama pull {MODEL_NAME}' 명령어로 모델을 설치해주세요."
        # [추가] Timeout 오류 메시지를 더 친절하게 보여줍니다.
        elif "timed out" in str(e):
            return "Ollama 응답 시간 초과: 모델을 로딩하는 데 시간이 더 필요합니다. 잠시 후 다시 시도해주세요."
        elif "connection refused" in str(e):
            return "Ollama 오류: Ollama 서버에 연결할 수 없습니다. 프로그램이 실행 중인지 확인해주세요."
        return "죄송합니다, 답변을 생성하는 중 서버에 오류가 발생했습니다."

def get_it_jobs():
    """네이버 '블로그' 검색 API를 이용해 'IT 채용' 관련 포스팅을 가져오는 함수"""
    try:
        encText = urllib.parse.quote("IT 채용 공고")
        url = "https://openapi.naver.com/v1/search/blog?query=" + encText + "&display=5&sort=sim"
        request = urllib.request.Request(url)
        request.add_header("X-Naver-Client-Id", CLIENT_ID)
        request.add_header("X-Naver-Client-Secret", CLIENT_SECRET)
        
        response = urllib.request.urlopen(request)
        rescode = response.getcode()

        if rescode == 200:
            response_body = response.read().decode('utf-8')
            blog_data = json.loads(response_body)
            
            postings = []
            for item in blog_data['items']:
                title = item['title'].replace('<b>', '').replace('</b>', '')
                link = item['link']
                # 블로그 검색 결과에는 '회사명'이 없으므로, 제목과 링크만 가져옵니다.
                postings.append({'title': title, 'link': link})
            
            return postings
        else:
            return []
    except Exception as e:
        print(f"블로그 포스팅 검색 중 에러 발생: {e}")
        return []

def get_it_news():
    """네이버 뉴스 API를 호출하여 IT 뉴스 20개를 가져오는 함수"""
    try:
        encText = urllib.parse.quote("IT 직종")
        url = "https://openapi.naver.com/v1/search/news?query=" + encText + "&display=20&sort=sim"
        
        request = urllib.request.Request(url)
        request.add_header("X-Naver-Client-Id", CLIENT_ID)
        request.add_header("X-Naver-Client-Secret", CLIENT_SECRET)
        
        response = urllib.request.urlopen(request)
        rescode = response.getcode()

        if rescode == 200:
            response_body = response.read().decode('utf-8')
            news_data = json.loads(response_body)
            
            # 기사 목록을 저장할 리스트
            articles = []
            for item in news_data['items']:
                # HTML 태그 제거
                title = item['title'].replace('<b>', '').replace('</b>', '')
                link = item['link']
                
                # 각 기사를 딕셔너리 형태로 저장하여 리스트에 추가
                articles.append({'title': title, 'link': link})
            
            return articles # print 대신, 가공된 뉴스 리스트를 반환!
        else:
            return [] # 에러 발생 시 빈 리스트 반환
    except Exception as e:
        print(f"Error fetching news: {e}")
        return [] # 예외 발생 시 빈 리스트 반환
    
# === 6. Flask API 엔드포인트 (라우트) ===

@app.route('/')
def home():
    news_articles = get_it_news()   # 기존 뉴스 크롤링 함수
    job_postings = get_it_jobs()    # 새로 추가한 채용 공고 크롤링 함수

    return render_template(
        'home.html', 
        news_list=news_articles, 
        job_list=job_postings  # job_list 라는 이름으로 채용 공고 데이터를 전달
    )

@app.route('/chatbot')
def chatbot():
    return render_template('chatbot.html')

@app.route('/taja')
def taja():
    return render_template('taja.html')

@app.route('/mypage')
def mypage():
    return render_template('mypage.html')

@app.route('/IT')
def IT():
    return render_template('IT.html')

@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/ask', methods=['POST'])
def ask_chatbot():
    """ 챗봇을 위한 메인 API 엔드포인트입니다. """
    if embedder is None or chroma_collection is None:
        return jsonify({"error": "RAG 시스템이 준비되지 않았습니다."}), 500
        
    data = request.json
    question = data.get('question', '')
    history = data.get('history', [])
    
    if not question:
        return jsonify({"error": "질문이 제공되지 않았습니다."}), 400
        
    answer = run_ollama_chat(question, history)
    
    # 다음 차례를 위해 대화 기록을 업데이트합니다.
    updated_history = history + [{"role": "user", "content": question}, {"role": "assistant", "content": answer}]
    
    return jsonify({"answer": answer, "history": updated_history})


# === 7. 메인 실행 블록 ===
if __name__ == "__main__":
    initialize_rag_system()
    print(f"💬 Flask 서버가 http://localhost:5000 에서 시작됩니다. 모델: {MODEL_NAME}")
    app.run(host='0.0.0.0', port=5000, debug=True)

