import anime from 'animejs';

/**
 * Split text node into individual character spans for animation.
 * @param element - The element whose text should be split
 * @param className - Optional class for each character span
 * @returns Array of character span elements
 */
export function splitLetters(element: HTMLElement, className = 'char'): HTMLElement[] {
  const text = element.textContent || '';
  element.textContent = '';
  
  const fragment = document.createDocumentFragment();
  const chars: HTMLElement[] = [];
  
  [...text].forEach((ch) => {
    const span = document.createElement('span');
    span.className = className;
    span.textContent = ch;
    span.style.display = 'inline-block';
    fragment.appendChild(span);
    chars.push(span);
  });
  
  element.appendChild(fragment);
  return chars;
}

/**
 * Split text node into word spans.
 */
export function splitWords(element: HTMLElement, className = 'word'): HTMLElement[] {
  const text = element.textContent || '';
  element.textContent = '';
  
  const fragment = document.createDocumentFragment();
  const words: HTMLElement[] = [];
  
  text.split(/\s+/).forEach((word, i, arr) => {
    const span = document.createElement('span');
    span.className = className;
    span.textContent = word;
    span.style.display = 'inline-block';
    fragment.appendChild(span);
    words.push(span);
    
    if (i < arr.length - 1) {
      fragment.appendChild(document.createTextNode(' '));
    }
  });
  
  element.appendChild(fragment);
  return words;
}

/**
 * Letter reveal animation with stagger from center.
 */
export function letterReveal(
  chars: HTMLElement[],
  options: {
    delay?: number;
    duration?: number;
    translateY?: number;
    from?: 'first' | 'center' | 'last';
  } = {}
) {
  const { delay = 0, duration = 650, translateY = 40, from = 'center' } = options;
  
  return anime({
    targets: chars,
    opacity: [0, 1],
    translateY: [translateY, 0],
    rotateZ: [from === 'center' ? 0 : -3, 0],
    delay: anime.stagger(30, { from, start: delay }),
    duration,
    easing: 'easeOutBack'
  });
}

/**
 * Word cascade effect (horizontal + opacity).
 */
export function wordCascade(words: HTMLElement[], options: { delay?: number } = {}) {
  const { delay = 0 } = options;
  
  return anime({
    targets: words,
    opacity: [0, 1],
    translateX: [-20, 0],
    delay: anime.stagger(80, { start: delay }),
    duration: 520,
    easing: 'easeOutCubic'
  });
}
