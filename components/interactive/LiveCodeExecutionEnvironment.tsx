'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/lib/LanguageContext';

interface LiveCodeExecutionEnvironmentProps {
  username: string;
  repos: Array<{
    id: number;
    name: string;
    language: string | null;
    topics: string[];
  }>;
}

interface ExecutionResult {
  output: string;
  error: string;
  executionTime: number;
  status: 'success' | 'error' | 'running';
}

const supportedLanguages = [
  { name: 'JavaScript', value: 'javascript', icon: '🟨' },
  { name: 'TypeScript', value: 'typescript', icon: '🔷' },
  { name: 'Python', value: 'python', icon: '🐍' },
  { name: 'Java', value: 'java', icon: '☕' },
  { name: 'C++', value: 'cpp', icon: '⚡' },
  { name: 'C#', value: 'csharp', icon: '💎' },
  { name: 'Go', value: 'go', icon: '🐹' },
  { name: 'Rust', value: 'rust', icon: '🦀' },
  { name: 'PHP', value: 'php', icon: '🐘' },
  { name: 'Ruby', value: 'ruby', icon: '💎' },
];

const sampleCode = {
  javascript: `// Sample JavaScript Code
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log('Fibonacci of 10:', fibonacci(10));

// Array operations
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
console.log('Doubled numbers:', doubled);

// Object manipulation
const user = { name: 'John', age: 30 };
console.log('User:', user);`,

  typescript: `// Sample TypeScript Code
interface User {
  name: string;
  age: number;
  email?: string;
}

function createUser(name: string, age: number): User {
  return { name, age };
}

function greetUser(user: User): string {
  return \`Hello, \${user.name}! You are \${user.age} years old.\`;
}

const user = createUser('Alice', 25);
console.log(greetUser(user));

// Generic function
function identity<T>(arg: T): T {
  return arg;
}

console.log(identity<string>('Hello TypeScript'));
console.log(identity<number>(42));`,

  python: `# Sample Python Code
def fibonacci(n):
    """Calculate the nth Fibonacci number"""
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print(f"Fibonacci of 10: {fibonacci(10)}")

# List comprehensions
numbers = [1, 2, 3, 4, 5]
doubled = [n * 2 for n in numbers]
print(f"Doubled numbers: {doubled}")

# Dictionary operations
user = {"name": "John", "age": 30, "city": "New York"}
print(f"User: {user}")

# Class definition
class Calculator:
    def add(self, a, b):
        return a + b

    def multiply(self, a, b):
        return a * b

calc = Calculator()
print(f"5 + 3 = {calc.add(5, 3)}")
print(f"5 * 3 = {calc.multiply(5, 3)}")`,

  java: `// Sample Java Code
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, Java!");

        // Fibonacci calculation
        int n = 10;
        System.out.println("Fibonacci of " + n + ": " + fibonacci(n));

        // Array operations
        int[] numbers = {1, 2, 3, 4, 5};
        System.out.print("Original array: ");
        for (int num : numbers) {
            System.out.print(num + " ");
        }
        System.out.println();

        // Object creation
        Person person = new Person("Alice", 25);
        System.out.println("Person: " + person.getName() + ", Age: " + person.getAge());
    }

    public static int fibonacci(int n) {
        if (n <= 1) return n;
        return fibonacci(n - 1) + fibonacci(n - 2);
    }
}

class Person {
    private String name;
    private int age;

    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }

    public String getName() { return name; }
    public int getAge() { return age; }
}`,

  cpp: `// Sample C++ Code
#include <iostream>
#include <vector>
#include <string>

int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

class Calculator {
public:
    int add(int a, int b) { return a + b; }
    int multiply(int a, int b) { return a * b; }
};

int main() {
    std::cout << "Hello, C++!" << std::endl;

    // Fibonacci
    int n = 10;
    std::cout << "Fibonacci of " << n << ": " << fibonacci(n) << std::endl;

    // Vector operations
    std::vector<int> numbers = {1, 2, 3, 4, 5};
    std::cout << "Numbers: ";
    for (int num : numbers) {
        std::cout << num << " ";
    }
    std::cout << std::endl;

    // Class usage
    Calculator calc;
    std::cout << "5 + 3 = " << calc.add(5, 3) << std::endl;
    std::cout << "5 * 3 = " << calc.multiply(5, 3) << std::endl;

    return 0;
}`,

  csharp: `// Sample C# Code
using System;
using System.Collections.Generic;

class Program {
    static void Main(string[] args) {
        Console.WriteLine("Hello, C#!");

        // Fibonacci
        int n = 10;
        Console.WriteLine($"Fibonacci of {n}: {Fibonacci(n)}");

        // List operations
        List<int> numbers = new List<int> { 1, 2, 3, 4, 5 };
        Console.Write("Original list: ");
        foreach (int num in numbers) {
            Console.Write(num + " ");
        }
        Console.WriteLine();

        // LINQ operations
        var doubled = numbers.Select(x => x * 2).ToList();
        Console.Write("Doubled: ");
        foreach (int num in doubled) {
            Console.Write(num + " ");
        }
        Console.WriteLine();

        // Object creation
        Person person = new Person("Alice", 25);
        Console.WriteLine($"Person: {person.Name}, Age: {person.Age}");
    }

    static int Fibonacci(int n) {
        if (n <= 1) return n;
        return Fibonacci(n - 1) + Fibonacci(n - 2);
    }
}

class Person {
    public string Name { get; set; }
    public int Age { get; set; }

    public Person(string name, int age) {
        Name = name;
        Age = age;
    }
}`,

  go: `// Sample Go Code
package main

import (
    "fmt"
    "time"
)

func fibonacci(n int) int {
    if n <= 1 {
        return n
    }
    return fibonacci(n-1) + fibonacci(n-2)
}

type Calculator struct{}

func (c Calculator) Add(a, b int) int {
    return a + b
}

func (c Calculator) Multiply(a, b int) int {
    return a * b
}

func main() {
    fmt.Println("Hello, Go!")

    // Fibonacci
    n := 10
    fmt.Printf("Fibonacci of %d: %d\\n", n, fibonacci(n))

    // Slice operations
    numbers := []int{1, 2, 3, 4, 5}
    fmt.Printf("Original slice: %v\\n", numbers)

    // Map operations
    doubled := make([]int, len(numbers))
    for i, num := range numbers {
        doubled[i] = num * 2
    }
    fmt.Printf("Doubled: %v\\n", doubled)

    // Struct usage
    calc := Calculator{}
    fmt.Printf("5 + 3 = %d\\n", calc.Add(5, 3))
    fmt.Printf("5 * 3 = %d\\n", calc.Multiply(5, 3))

    // Current time
    fmt.Printf("Current time: %s\\n", time.Now().Format("2006-01-02 15:04:05"))
}`,

  rust: `// Sample Rust Code
fn fibonacci(n: u32) -> u32 {
    match n {
        0 => 0,
        1 => 1,
        _ => fibonacci(n - 1) + fibonacci(n - 2),
    }
}

struct Calculator;

impl Calculator {
    fn add(&self, a: i32, b: i32) -> i32 {
        a + b
    }

    fn multiply(&self, a: i32, b: i32) -> i32 {
        a * b
    }
}

fn main() {
    println!("Hello, Rust!");

    // Fibonacci
    let n = 10;
    println!("Fibonacci of {}: {}", n, fibonacci(n));

    // Vector operations
    let numbers = vec![1, 2, 3, 4, 5];
    println!("Original vector: {:?}", numbers);

    // Iterator operations
    let doubled: Vec<i32> = numbers.iter().map(|&x| x * 2).collect();
    println!("Doubled: {:?}", doubled);

    // Struct usage
    let calc = Calculator;
    println!("5 + 3 = {}", calc.add(5, 3));
    println!("5 * 3 = {}", calc.multiply(5, 3));

    // Pattern matching
    let result = match calc.add(5, 3) {
        0..=5 => "Small number",
        6..=10 => "Medium number",
        _ => "Large number",
    };
    println!("Result category: {}", result);
}`,

  php: `<?php
// Sample PHP Code
function fibonacci($n) {
    if ($n <= 1) return $n;
    return fibonacci($n - 1) + fibonacci($n - 2);
}

class Calculator {
    public function add($a, $b) {
        return $a + $b;
    }

    public function multiply($a, $b) {
        return $a * $b;
    }
}

echo "Hello, PHP!\\n";

// Fibonacci
$n = 10;
echo "Fibonacci of $n: " . fibonacci($n) . "\\n";

// Array operations
$numbers = [1, 2, 3, 4, 5];
echo "Original array: " . implode(", ", $numbers) . "\\n";

// Array map
$doubled = array_map(function($num) {
    return $num * 2;
}, $numbers);
echo "Doubled: " . implode(", ", $doubled) . "\\n";

// Class usage
$calc = new Calculator();
echo "5 + 3 = " . $calc->add(5, 3) . "\\n";
echo "5 * 3 = " . $calc->multiply(5, 3) . "\\n";

// Associative array
$user = [
    "name" => "John",
    "age" => 30,
    "city" => "New York"
];
echo "User: " . json_encode($user) . "\\n";
?>`,

  ruby: `# Sample Ruby Code
def fibonacci(n)
  return n if n <= 1
  fibonacci(n - 1) + fibonacci(n - 2)
end

class Calculator
  def add(a, b)
    a + b
  end

  def multiply(a, b)
    a * b
  end
end

puts "Hello, Ruby!"

# Fibonacci
n = 10
puts "Fibonacci of #{n}: #{fibonacci(n)}"

# Array operations
numbers = [1, 2, 3, 4, 5]
puts "Original array: #{numbers.inspect}"

# Array map
doubled = numbers.map { |num| num * 2 }
puts "Doubled: #{doubled.inspect}"

# Class usage
calc = Calculator.new
puts "5 + 3 = #{calc.add(5, 3)}"
puts "5 * 3 = #{calc.multiply(5, 3)}"

# Hash operations
user = { name: "Alice", age: 25, city: "London" }
puts "User: #{user.inspect}"

# String interpolation and methods
greeting = "Hello, #{user[:name]}!"
puts greeting.upcase`,
};

export default function LiveCodeExecutionEnvironment({
  username,
  repos
}: LiveCodeExecutionEnvironmentProps) {
  const { t } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState(sampleCode.javascript);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [savedSnippets, setSavedSnippets] = useState<Array<{
    id: string;
    title: string;
    language: string;
    code: string;
    createdAt: string;
  }>>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Load saved snippets from localStorage
    const saved = localStorage.getItem(`code-snippets-${username}`);
    if (saved) {
      try {
        setSavedSnippets(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading saved snippets:', error);
      }
    }
  }, [username]);

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
    setCode(sampleCode[language as keyof typeof sampleCode] || '');
    setResult(null);
  };

  const executeCode = async () => {
    setIsRunning(true);
    setResult({ output: '', error: '', executionTime: 0, status: 'running' });

    const startTime = Date.now();

    try {
      // Simulate code execution (in a real implementation, this would call a backend API)
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

      // Mock execution results based on language
      let mockOutput = '';
      let mockError = '';

      switch (selectedLanguage) {
        case 'javascript':
        case 'typescript':
          mockOutput = 'Fibonacci of 10: 55\nDoubled numbers: [2, 4, 6, 8, 10]\nUser: {name: "John", age: 30}';
          break;
        case 'python':
          mockOutput = 'Fibonacci of 10: 55\nDoubled numbers: [2, 4, 6, 8, 10]\nUser: {\'name\': \'John\', \'age\': 30}\n5 + 3 = 8\n5 * 3 = 15';
          break;
        case 'java':
          mockOutput = 'Hello, Java!\nFibonacci of 10: 55\nOriginal array: 1 2 3 4 5 \nPerson: Alice, Age: 25';
          break;
        case 'cpp':
          mockOutput = 'Hello, C++!\nFibonacci of 10: 55\nNumbers: 1 2 3 4 5 \n5 + 3 = 8\n5 * 3 = 15';
          break;
        case 'csharp':
          mockOutput = 'Hello, C#!\nFibonacci of 10: 55\nOriginal list: 1 2 3 4 5 \nDoubled: 2 4 6 8 10 \nPerson: Alice, Age: 25';
          break;
        case 'go':
          mockOutput = 'Hello, Go!\nFibonacci of 10: 55\nOriginal slice: [1 2 3 4 5]\nDoubled: [2 4 6 8 10]\n5 + 3 = 8\n5 * 3 = 15\nCurrent time: 2024-01-01 12:00:00';
          break;
        case 'rust':
          mockOutput = 'Hello, Rust!\nFibonacci of 10: 55\nOriginal vector: [1, 2, 3, 4, 5]\nDoubled: [2, 4, 6, 8, 10]\n5 + 3 = 8\n5 * 3 = 15\nResult category: Medium number';
          break;
        case 'php':
          mockOutput = 'Hello, PHP!\nFibonacci of 10: 55\nOriginal array: 1, 2, 3, 4, 5\nDoubled: 2, 4, 6, 8, 10\n5 + 3 = 8\n5 * 3 = 15\nUser: {"name":"John","age":30,"city":"New York"}';
          break;
        case 'ruby':
          mockOutput = 'Hello, Ruby!\nFibonacci of 10: 55\nOriginal array: [1, 2, 3, 4, 5]\nDoubled: [2, 4, 6, 8, 10]\n5 + 3 = 8\n5 * 3 = 15\nUser: {:name=>"Alice", :age=>25, :city=>"London"}\nHELLO, ALICE!';
          break;
        default:
          mockOutput = `Hello, ${selectedLanguage}!`;
      }

      const executionTime = Date.now() - startTime;

      setResult({
        output: mockOutput,
        error: mockError,
        executionTime,
        status: 'success'
      });
    } catch (error) {
      const executionTime = Date.now() - startTime;
      setResult({
        output: '',
        error: `Execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        executionTime,
        status: 'error'
      });
    } finally {
      setIsRunning(false);
    }
  };

  const saveSnippet = () => {
    const title = prompt('Enter a title for this snippet:');
    if (!title) return;

    const newSnippet = {
      id: Date.now().toString(),
      title,
      language: selectedLanguage,
      code,
      createdAt: new Date().toISOString(),
    };

    const updatedSnippets = [...savedSnippets, newSnippet];
    setSavedSnippets(updatedSnippets);
    localStorage.setItem(`code-snippets-${username}`, JSON.stringify(updatedSnippets));
  };

  const loadSnippet = (snippet: any) => {
    setSelectedLanguage(snippet.language);
    setCode(snippet.code);
    setResult(null);
  };

  const deleteSnippet = (id: string) => {
    const updatedSnippets = savedSnippets.filter(s => s.id !== id);
    setSavedSnippets(updatedSnippets);
    localStorage.setItem(`code-snippets-${username}`, JSON.stringify(updatedSnippets));
  };

  return (
    <motion.div
      className='card'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h2 className='text-2xl font-bold'>Live Code Execution</h2>
          <p className='text-[var(--text-secondary)] mt-1'>
            Write, run, and test code in multiple programming languages
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <span className='text-sm text-[var(--text-secondary)]'>Saved: {savedSnippets.length}</span>
        </div>
      </div>

      {/* Language Selector */}
      <div className='flex flex-wrap gap-2 mb-6'>
        {supportedLanguages.map((lang) => (
          <motion.button
            key={lang.value}
            onClick={() => handleLanguageChange(lang.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedLanguage === lang.value
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'bg-gray-500/20 text-gray-400 border border-gray-500/30 hover:bg-gray-500/30'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className='mr-2'>{lang.icon}</span>
            {lang.name}
          </motion.button>
        ))}
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Code Editor */}
        <div>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-lg font-semibold'>Code Editor</h3>
            <div className='flex gap-2'>
              <motion.button
                onClick={saveSnippet}
                className='px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded text-sm hover:bg-green-500/30 transition-colors'
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                💾 Save
              </motion.button>
              <motion.button
                onClick={executeCode}
                disabled={isRunning}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  isRunning
                    ? 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30'
                }`}
                whileHover={!isRunning ? { scale: 1.05 } : {}}
                whileTap={!isRunning ? { scale: 0.95 } : {}}
              >
                {isRunning ? '⏳ Running...' : '▶️ Run'}
              </motion.button>
            </div>
          </div>

          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className='w-full h-96 bg-gray-900 text-gray-100 border border-gray-700 rounded-lg p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none'
            placeholder='Write your code here...'
            spellCheck={false}
          />
        </div>

        {/* Output Panel */}
        <div>
          <h3 className='text-lg font-semibold mb-4'>Output</h3>

          <div className='bg-gray-900 border border-gray-700 rounded-lg p-4 h-96 overflow-auto'>
            <AnimatePresence mode='wait'>
              {result ? (
                <motion.div
                  key={result.status}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className='font-mono text-sm'
                >
                  {result.status === 'running' && (
                    <div className='flex items-center gap-2 text-blue-400'>
                      <div className='w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin'></div>
                      Executing code...
                    </div>
                  )}

                  {result.status === 'success' && (
                    <div>
                      <div className='text-green-400 mb-2'>✅ Execution successful</div>
                      <pre className='text-gray-300 whitespace-pre-wrap'>{result.output}</pre>
                      <div className='text-xs text-gray-500 mt-2'>
                        Execution time: {result.executionTime}ms
                      </div>
                    </div>
                  )}

                  {result.status === 'error' && (
                    <div>
                      <div className='text-red-400 mb-2'>❌ Execution failed</div>
                      <pre className='text-red-300 whitespace-pre-wrap'>{result.error}</pre>
                      <div className='text-xs text-gray-500 mt-2'>
                        Execution time: {result.executionTime}ms
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className='text-gray-500 text-center flex items-center justify-center h-full'>
                  <div>
                    <div className='text-4xl mb-4'>💻</div>
                    <p>Click "Run" to execute your code</p>
                    <p className='text-xs mt-2'>Supported languages: {supportedLanguages.map(l => l.name).join(', ')}</p>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Saved Snippets */}
      {savedSnippets.length > 0 && (
        <div className='mt-8'>
          <h3 className='text-lg font-semibold mb-4'>Saved Snippets</h3>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {savedSnippets.map((snippet) => (
              <motion.div
                key={snippet.id}
                className='bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-4'
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className='flex items-start justify-between mb-2'>
                  <h4 className='font-medium text-sm line-clamp-1'>{snippet.title}</h4>
                  <button
                    onClick={() => deleteSnippet(snippet.id)}
                    className='text-red-400 hover:text-red-300 text-sm'
                  >
                    🗑️
                  </button>
                </div>
                <div className='flex items-center gap-2 mb-3'>
                  <span className='text-xs text-[var(--text-secondary)] uppercase'>
                    {snippet.language}
                  </span>
                  <span className='text-xs text-[var(--text-secondary)]'>
                    {new Date(snippet.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <motion.button
                  onClick={() => loadSnippet(snippet)}
                  className='w-full px-3 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded text-sm hover:bg-blue-500/30 transition-colors'
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Load Snippet
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}