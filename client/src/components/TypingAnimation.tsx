import { useState, useEffect } from 'react';

interface TypingAnimationProps {
  text: string;
  speed?: number;
  className?: string;
  onTyping?: () => void;
}

export function TypingAnimation({ text, speed = 30, className = "", onTyping }: TypingAnimationProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
        
        // Call scroll callback on each character
        if (onTyping) {
          onTyping();
        }
      }, speed);

      return () => clearTimeout(timer);
    }
  }, [currentIndex, text, speed]);

  useEffect(() => {
    // Reset when text changes
    setDisplayedText("");
    setCurrentIndex(0);
  }, [text]);

  return (
    <div className={className}>
      <span className="whitespace-pre-line">{displayedText}</span>
      {currentIndex < text.length && (
        <span className="animate-pulse">|</span>
      )}
    </div>
  );
}