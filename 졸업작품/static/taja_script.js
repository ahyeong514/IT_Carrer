const textInput = document.getElementById('text-input');
const codeDisplay = document.getElementById('code-display');
const keystrokesElement = document.getElementById('keystrokes');
const timeElapsedElement = document.getElementById('time-elapsed');
const accuracyElement = document.getElementById('accuracy');
const restartBtn = document.getElementById('restart-btn');
const nextBtn = document.getElementById('next-btn');

const codeSnippets = [
    [
        "def factorial(n):",
        "    if n == 0:",
        "        return 1",
        "    return n * factorial(n - 1)"
    ],
    [
        "for number in range(1, 101):",
        "    if number % 15 == 0:",
        "        print('FizzBuzz')",
        "    elif number % 3 == 0:",
        "        print('Fizz')",
        "    elif number % 5 == 0:",
        "        print('Buzz')",
        "    else:",
        "        print(number)"
    ],
    [
        "def reverse_text(text):",
        "    reversed_chars = []",
        "    for char in text:",
        "        reversed_chars.insert(0, char)",
        "    return ''.join(reversed_chars)",
        "",
        "print(reverse_text('python'))"
    ],
    [
        "def is_palindrome(text):",
        "    cleaned = ''.join(char.lower() for char in text if char.isalnum())",
        "    return cleaned == cleaned[::-1]",
        "",
        "word = 'Never odd or even'",
        "print(is_palindrome(word))"
    ],
    [
        "def list_primes(limit):",
        "    primes = []",
        "    for number in range(2, limit + 1):",
        "        for divisor in range(2, int(number ** 0.5) + 1):",
        "            if number % divisor == 0:",
        "                break",
        "        else:",
        "            primes.append(number)",
        "    return primes",
        "",
        "print(list_primes(30))"
    ],
    [
        "def quicksort(values):",
        "    if len(values) <= 1:",
        "        return values",
        "    pivot = values[len(values) // 2]",
        "    lesser = [x for x in values if x < pivot]",
        "    equal = [x for x in values if x == pivot]",
        "    greater = [x for x in values if x > pivot]",
        "    return quicksort(lesser) + equal + quicksort(greater)"
    ],
    [
        "settings_default = {'theme': 'light', 'language': 'ko'}",
        "settings_override = {'language': 'en', 'autosave': True}",
        "",
        "merged_settings = {**settings_default, **settings_override}",
        "print(merged_settings)"
    ],
    [
        "def count_characters(text):",
        "    counts = {}",
        "    for char in text:",
        "        if char not in counts:",
        "            counts[char] = 0",
        "        counts[char] += 1",
        "    return counts",
        "",
        "print(count_characters('banana'))"
    ],
    [
        "from pathlib import Path",
        "",
        "path = Path('data.txt')",
        "for line in path.read_text().splitlines():",
        "    print(line.strip())"
    ],
    [
        "from collections import Counter",
        "",
        "sentence = 'the quick brown fox jumps over the lazy dog'",
        "word_counts = Counter(sentence.split())",
        "for word, count in word_counts.items():",
        "    print(f'{word}: {count}')"
    ],
    [
        "def celsius_to_fahrenheit(celsius):",
        "    return celsius * 9 / 5 + 32",
        "",
        "for value in range(-10, 31, 10):",
        "    converted = celsius_to_fahrenheit(value)",
        "    print(f'{value}C => {converted}F')"
    ],
    [
        "import re",
        "",
        "pattern = re.compile(r'^[\\w.-]+@[\\w.-]+\\.\\w+$')",
        "emails = ['info@example.com', 'invalid-email', 'team@company.org']",
        "for email in emails:",
        "    print(email, '=>', bool(pattern.match(email)))"
    ],
    [
        "class Car:",
        "    def __init__(self, brand, model):",
        "        self.brand = brand",
        "        self.model = model",
        "",
        "    def full_name(self):",
        "        return f'{self.brand} {self.model}'",
        "",
        "car = Car('Hyundai', 'Ioniq 6')",
        "print(car.full_name())"
    ],
    [
        "from dataclasses import dataclass",
        "",
        "@dataclass",
        "class Student:",
        "    name: str",
        "    grade: int",
        "",
        "student = Student('Mina', 3)",
        "print(student)"
    ],
    [
        "lines = ['apple', 'banana', 'cherry']",
        "with open('fruits.txt', 'w', encoding='utf-8') as file:",
        "    for line in lines:",
        "        file.write(line + '\\n')",
        "",
        "print('fruits.txt saved')"
    ],
    [
        "def fibonacci(limit):",
        "    a, b = 0, 1",
        "    while a < limit:",
        "        yield a",
        "        a, b = b, a + b",
        "",
        "for value in fibonacci(100):",
        "    print(value)"
    ],
    [
        "import time",
        "",
        "def timer(func):",
        "    def wrapper(*args, **kwargs):",
        "        start = time.perf_counter()",
        "        result = func(*args, **kwargs)",
        "        duration = time.perf_counter() - start",
        "        print(f'{func.__name__} took {duration:.4f}s')",
        "        return result",
        "    return wrapper",
        "",
        "@timer",
        "def slow_operation():",
        "    time.sleep(0.2)",
        "",
        "slow_operation()"
    ],
    [
        "import asyncio",
        "",
        "async def fetch_data(index):",
        "    await asyncio.sleep(0.1)",
        "    return f'data-{index}'",
        "",
        "async def main():",
        "    tasks = [fetch_data(i) for i in range(3)]",
        "    results = await asyncio.gather(*tasks)",
        "    print(results)",
        "",
        "asyncio.run(main())"
    ],
    [
        "def binary_search(values, target):",
        "    left, right = 0, len(values) - 1",
        "    while left <= right:",
        "        mid = (left + right) // 2",
        "        if values[mid] == target:",
        "            return mid",
        "        if values[mid] < target:",
        "            left = mid + 1",
        "        else:",
        "            right = mid - 1",
        "    return -1",
        "",
        "print(binary_search([1, 3, 5, 7, 9], 7))"
    ],
    [
        "def bubble_sort(values):",
        "    n = len(values)",
        "    for i in range(n):",
        "        for j in range(0, n - i - 1):",
        "            if values[j] > values[j + 1]:",
        "                values[j], values[j + 1] = values[j + 1], values[j]",
        "",
        "numbers = [5, 1, 4, 2, 8]",
        "bubble_sort(numbers)",
        "print(numbers)"
    ],
    [
        "squares = [number ** 2 for number in range(10)]",
        "print(squares)"
    ],
    [
        "fruits = ['apple', 'banana', 'cherry']",
        "lengths = {fruit: len(fruit) for fruit in fruits}",
        "print(lengths)"
    ],
    [
        "words = ['desk', 'door', 'chair', 'clock']",
        "first_letters = {word[0] for word in words}",
        "print(first_letters)"
    ],
    [
        "def read_integer():",
        "    try:",
        "        value = int(input('Enter a number: '))",
        "    except ValueError:",
        "        print('That was not a valid number.')",
        "    else:",
        "        print('You typed', value)",
        "",
        "# read_integer()"
    ],
    [
        "import logging",
        "",
        "logging.basicConfig(level=logging.INFO, format='[%(levelname)s] %(message)s')",
        "logger = logging.getLogger('demo')",
        "logger.info('Application started')",
        "logger.warning('Low disk space')"
    ],
    [
        "from collections import namedtuple",
        "",
        "Point = namedtuple('Point', ['x', 'y'])",
        "p1 = Point(3, 4)",
        "print(p1.x, p1.y)"
    ],
    [
        "from datetime import datetime, timedelta",
        "",
        "now = datetime.now()",
        "future = now + timedelta(days=5)",
        "difference = future - now",
        "print(difference)"
    ],
    [
        "from pathlib import Path",
        "",
        "for path in Path('.').iterdir():",
        "    if path.is_file():",
        "        print(path.name)"
    ],
    [
        "import random",
        "",
        "secret = random.randint(1, 10)",
        "guesses = []",
        "while len(guesses) < 3:",
        "    guess = random.randint(1, 10)",
        "    guesses.append(guess)",
        "    if guess == secret:",
        "        print('Found it!')",
        "        break",
        "else:",
        "    print('No luck this time.')"
    ],
    [
        "names = ['Min', 'Ara', 'Jin']",
        "for index, name in enumerate(names, start=1):",
        "    print(f'{index}. {name}')"
    ],
    [
        "import os",
        "",
        "current_dir = os.getcwd()",
        "print(f'Current directory: {current_dir}')"
    ],
    [
        "import math",
        "",
        "radius = 5",
        "area = math.pi * radius ** 2",
        "print(f'Area is: {area:.2f}')"
    ],
    [
        "def sum_all(*args):",
        "    total = 0",
        "    for num in args:",
        "        total += num",
        "    return total",
        "",
        "print(sum_all(1, 2, 3, 4, 5))"
    ],
    [
        "data = {'a': 1, 'b': 2, 'c': 3}",
        "for key, value in data.items():",
        "    print(f'{key}: {value}')"
    ],
    [
        "try:",
        "    num = int('abc')",
        "except ValueError as e:",
        "    print('Error:', e)"
    ],
    [
        "def is_leap_year(year):",
        "    return (year % 4 == 0 and year % 100 != 0) or (year % 400 == 0)",
        "",
        "print(is_leap_year(2024))"
    ],
    [
        "def find_max(numbers):",
        "    return max(numbers)",
        "",
        "my_list = [10, 20, 5, 30, 15]",
        "print(find_max(my_list))"
    ],
    [
        "text = 'hello world'",
        "print(text.upper())",
        "print(text.lower())"
    ],
    [
        "def celsius_to_fahrenheit(c):",
        "    return (c * 9/5) + 32",
        "",
        "print(celsius_to_fahrenheit(25))"
    ],
    [
        "def convert_to_titlecase(text):",
        "    return text.title()",
        "",
        "print(convert_to_titlecase('this is a test'))"
    ],
    [
        "import datetime",
        "",
        "today = datetime.date.today()",
        "print(today)"
    ],
    [
        "import json",
        "",
        "user_data = {'name': 'Alice', 'age': 30}",
        "json_string = json.dumps(user_data)",
        "print(json_string)"
    ],
    [
        "def count_vowels(s):",
        "    vowels = 'aeiou'",
        "    count = 0",
        "    for char in s.lower():",
        "        if char in vowels:",
        "            count += 1",
        "    return count",
        "",
        "print(count_vowels('Hello World'))"
    ],
    [
        "def get_even_numbers(l):",
        "    return [x for x in l if x % 2 == 0]",
        "",
        "numbers = [1, 2, 3, 4, 5, 6]",
        "print(get_even_numbers(numbers))"
    ],
    [
        "def reverse_string(s):",
        "    return s[::-1]",
        "",
        "print(reverse_string('python'))"
    ],
    [
        "from functools import reduce",
        "",
        "numbers = [1, 2, 3, 4]",
        "product = reduce(lambda x, y: x * y, numbers)",
        "print(product)"
    ],
    [
        "def filter_long_words(words, n):",
        "    return [word for word in words if len(word) > n]",
        "",
        "print(filter_long_words(['apple', 'banana', 'kiwi'], 5))"
    ],
    [
        "class Dog:",
        "    def __init__(self, name):",
        "        self.name = name",
        "    def bark(self):",
        "        return f'{self.name} says woof!'",
        "",
        "my_dog = Dog('Buddy')",
        "print(my_dog.bark())"
    ],
    [
        "def find_common_elements(list1, list2):",
        "    return list(set(list1) & set(list2))",
        "",
        "l1 = [1, 2, 3, 4]",
        "l2 = [3, 4, 5, 6]",
        "print(find_common_elements(l1, l2))"
    ],
    [
        "def get_unique_elements(l):",
        "    return list(set(l))",
        "",
        "numbers = [1, 2, 2, 3, 4, 4, 5]",
        "print(get_unique_elements(numbers))"
    ],
    [
        "def factorial_iterative(n):",
        "    result = 1",
        "    for i in range(1, n + 1):",
        "        result *= i",
        "    return result",
        "",
        "print(factorial_iterative(5))"
    ],
    [
        "def find_second_largest(numbers):",
        "    sorted_numbers = sorted(list(set(numbers)), reverse=True)",
        "    return sorted_numbers[1] if len(sorted_numbers) > 1 else None",
        "",
        "print(find_second_largest([1, 2, 3, 4, 5]))"
    ],
    [
        "def count_words(sentence):",
        "    return len(sentence.split())",
        "",
        "print(count_words('This is a test sentence.'))"
    ],
    [
        "def remove_duplicates(l):",
        "    return list(dict.fromkeys(l))",
        "",
        "print(remove_duplicates([1, 2, 2, 3, 4, 4]))"
    ],
    [
        "def sort_dictionary_by_value(d):",
        "    return dict(sorted(d.items(), key=lambda item: item[1]))",
        "",
        "d = {'a': 3, 'b': 1, 'c': 2}",
        "print(sort_dictionary_by_value(d))"
    ],
    [
        "import re",
        "",
        "text = 'The quick brown fox.'",
        "matches = re.findall(r'\\b\\w{4,}\\b', text)",
        "print(matches)"
    ],
    [
        "def get_file_extension(filename):",
        "    return filename.split('.')[-1]",
        "",
        "print(get_file_extension('image.jpg'))"
    ],
    [
        "import random",
        "",
        "choices = ['rock', 'paper', 'scissors']",
        "computer_choice = random.choice(choices)",
        "print(f'The computer chose {computer_choice}')"
    ],
    [
        "def is_prime(n):",
        "    if n < 2:",
        "        return False",
        "    for i in range(2, int(n**0.5) + 1):",
        "        if n % i == 0:",
        "            return False",
        "    return True",
        "",
        "print(is_prime(17))"
    ],
    [
        "def fibonacci_list(n):",
        "    a, b = 0, 1",
        "    result = []",
        "    while a < n:",
        "        result.append(a)",
        "        a, b = b, a + b",
        "    return result",
        "",
        "print(fibonacci_list(50))"
    ]
];

let currentLines = [];
let currentLineIndex = 0;
let startTime = 0;
let totalTypedCharacters = 0;
let correctCharactersTotal = 0;
let isTypingStarted = false;
let timerId = null;
let previousSnippetIndex = -1;

function selectRandomSnippet() {
    if (codeSnippets.length === 0) {
        return ["No snippets configured."];
    }

    if (codeSnippets.length === 1) {
        previousSnippetIndex = 0;
        return codeSnippets[0];
    }

    let nextIndex;
    do {
        nextIndex = Math.floor(Math.random() * codeSnippets.length);
    } while (nextIndex === previousSnippetIndex);

    previousSnippetIndex = nextIndex;
    return codeSnippets[nextIndex];
}

function initializeGame() {
    currentLines = selectRandomSnippet().slice();
    currentLineIndex = 0;
    startTime = 0;
    totalTypedCharacters = 0;
    correctCharactersTotal = 0;
    isTypingStarted = false;
    textInput.value = '';
    textInput.disabled = false;
    textInput.focus();
    keystrokesElement.innerText = '0';
    timeElapsedElement.innerText = '0';
    accuracyElement.innerText = '100';

    if (timerId) {
        clearInterval(timerId);
    }
    timerId = null;

    nextBtn.style.display = 'none';
    restartBtn.style.display = 'inline-block';

    renderCode();
    updateCursor();
}

function renderCode() {
    codeDisplay.innerHTML = '';

    currentLines.forEach((line, lineIndex) => {
        const lineDiv = document.createElement('div');
        if (lineIndex === currentLineIndex) {
            lineDiv.classList.add('current-line');
        }

        line.split('').forEach((char) => {
            const charSpan = document.createElement('span');
            charSpan.innerText = char;
            lineDiv.appendChild(charSpan);
        });

        codeDisplay.appendChild(lineDiv);
    });
}

function updateCursor() {
    const currentLineDiv = codeDisplay.querySelector('.current-line');
    if (!currentLineDiv) {
        return;
    }

    const typedValue = textInput.value;
    const currentLineText = currentLines[currentLineIndex] ?? '';
    const currentLineSpans = currentLineDiv.querySelectorAll('span');

    currentLineSpans.forEach((span, index) => {
        const typedChar = typedValue[index];
        const originalChar = currentLineText[index];

        if (typedChar === originalChar) {
            span.classList.remove('incorrect');
            span.classList.add('correct');
        } else if (typedChar != null) {
            span.classList.remove('correct');
            span.classList.add('incorrect');
        } else {
            span.classList.remove('correct', 'incorrect');
        }
    });

    codeDisplay.querySelectorAll('.current').forEach((element) => {
        element.classList.remove('current');
    });

    if (currentLineSpans[typedValue.length]) {
        currentLineSpans[typedValue.length].classList.add('current');
    }
}

textInput.addEventListener('input', () => {
    if (!isTypingStarted) {
        startTime = new Date().getTime();
        isTypingStarted = true;

        timerId = setInterval(() => {
            const timeElapsedInSeconds = Math.floor((new Date().getTime() - startTime) / 1000);
            timeElapsedElement.innerText = timeElapsedInSeconds.toString();
        }, 1000);
    }

    updateCursor();
});

textInput.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') {
        return;
    }

    event.preventDefault();

    if (currentLineIndex >= currentLines.length) {
        return;
    }

    const typedValue = textInput.value;
    const currentLineText = currentLines[currentLineIndex];

    let localCorrectChars = 0;
    const maxCompareLength = Math.min(typedValue.length, currentLineText.length);
    for (let i = 0; i < maxCompareLength; i++) {
        if (typedValue[i] === currentLineText[i]) {
            localCorrectChars++;
        }
    }

    totalTypedCharacters += typedValue.length;
    correctCharactersTotal += localCorrectChars;

    const overallAccuracy = totalTypedCharacters === 0
        ? 100
        : Math.round((correctCharactersTotal / totalTypedCharacters) * 100);
    keystrokesElement.innerText = totalTypedCharacters.toString();
    accuracyElement.innerText = overallAccuracy.toString();

    currentLineIndex++;
    textInput.value = '';

    if (currentLineIndex < currentLines.length) {
        renderCode();
        textInput.focus();
        updateCursor();
        return;
    }

    const endTime = new Date().getTime();
    const timeElapsedInSeconds = Math.floor((endTime - startTime) / 1000);
    timeElapsedElement.innerText = timeElapsedInSeconds.toString();

    textInput.disabled = true;
    isTypingStarted = false;

    if (timerId) {
        clearInterval(timerId);
        timerId = null;
    }

    nextBtn.style.display = 'inline-block';
    restartBtn.style.display = 'none';
});

restartBtn.addEventListener('click', initializeGame);
nextBtn.addEventListener('click', initializeGame);

window.addEventListener('load', initializeGame);