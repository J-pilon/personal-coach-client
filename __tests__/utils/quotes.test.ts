import { getRandomQuote, motivationalQuotes } from '@/utils/quotes';

describe('quotes utility', () => {
  test('getRandomQuote returns a valid quote object', () => {
    const quote = getRandomQuote();
    
    expect(quote).toHaveProperty('text');
    expect(quote).toHaveProperty('author');
    expect(typeof quote.text).toBe('string');
    expect(typeof quote.author).toBe('string');
    expect(quote.text.length).toBeGreaterThan(0);
    expect(quote.author.length).toBeGreaterThan(0);
  });

  test('getRandomQuote returns a quote from the predefined array', () => {
    const quote = getRandomQuote();
    
    const foundQuote = motivationalQuotes.find(q => 
      q.text === quote.text && q.author === quote.author
    );
    
    expect(foundQuote).toBeDefined();
  });

  test('motivationalQuotes array contains valid quote objects', () => {
    expect(motivationalQuotes).toBeInstanceOf(Array);
    expect(motivationalQuotes.length).toBeGreaterThan(0);
    
    motivationalQuotes.forEach(quote => {
      expect(quote).toHaveProperty('text');
      expect(quote).toHaveProperty('author');
      expect(typeof quote.text).toBe('string');
      expect(typeof quote.author).toBe('string');
      expect(quote.text.length).toBeGreaterThan(0);
      expect(quote.author.length).toBeGreaterThan(0);
    });
  });
}); 