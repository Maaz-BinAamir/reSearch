import pandas as pd
from nltk.stem import WordNetLemmatizer
from nltk import pos_tag  
from nltk.corpus import stopwords
import pandas as pd
import math
import os

lemmatizer = WordNetLemmatizer()

def get_wordnet_pos(treebank_tag):
    # adjective
    if treebank_tag.startswith('J'):
        return 'a'
    # verb
    elif treebank_tag.startswith('V'):
        return 'v'  
    # noun
    elif treebank_tag.startswith('N'):
        return 'n'  
    # adverb
    elif treebank_tag.startswith('R'):
        return 'r'  
    # for unknown or other tags
    else:
        return None  

def preprocess(text):
    # for removal of stop words 
    stop_words = set(stopwords.words('english')) 

    # Tokenize text into words
    # tokens = word_tokenize(text)

    # Process each token explicitly
    processed_tokens = []
    
    for word in text:
        # Convert the word to lowercase
        lowercased_word = word.lower()
        
        # Checks if the word is alphanumeric, not a stopword, and greater than 2 characters
        if lowercased_word.isalnum() and lowercased_word not in stop_words and len(lowercased_word) > 2:
            
        # Get POS tag in WordNet format using the helper function
            pos_tagged = pos_tag([lowercased_word])
                
            # pos_tagged gives [0] the word and [1] the parts of speech tag.
            wordnet_pos = get_wordnet_pos(pos_tagged[0][1])
                
            # Lemmatize the word using the correct POS tag
            if wordnet_pos:
                lemmatized_word = lemmatizer.lemmatize(lowercased_word, wordnet_pos)
            else:
                # Default to noun if no valid POS
                lemmatized_word = lemmatizer.lemmatize(lowercased_word)

            
            processed_tokens.append(lemmatized_word.lower())

    return processed_tokens
    
class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end = False

def build_trie(words):
    root = TrieNode()
    for word in words:
        current = root
        for char in word:
            if char not in current.children:
                current.children[char] = TrieNode()
            current = current.children[char]
        current.is_end = True
    return root

def autocomplete(root, prefix, limit=10):
    results = []
    node = root
    for char in prefix:
        if char not in node.children:
            return results
        node = node.children[char]
    def dfs(current, path):
        if len(results) >= limit:
            return
        if current.is_end:
            results.append(path)
        for ch in current.children:
            dfs(current.children[ch], path + ch)
    dfs(node, prefix)
    return results

def load_lexicon_trie():
    lexicon_path = "D:\\code\\DSAProject\\reSearch\\lexicon.csv"
    lexicon_df = pd.read_csv(lexicon_path)
    raw_lexicon = dict(zip(lexicon_df["Word"], lexicon_df["WordId"]))
    cleaned_lexicon = {}
    for k, v in raw_lexicon.items():
        if (isinstance(k, float) and math.isnan(k)) or not k.isalnum():
            continue
        cleaned_lexicon[str(k)] = v
    return cleaned_lexicon

def load_lexicon():
    lexicon_path = "D:\\code\\DSAProject\\reSearch\\lexicon.csv"

    # Load the lexicon into a dictionary
    lexicon_df = pd.read_csv(lexicon_path)
    return dict(zip(lexicon_df["Word"], lexicon_df["WordId"]))

def read_row_by_byte_offset(file, byte_offset, doc_id):
    """
    Read a row from the open file using byte offset.
    """
    file.seek(byte_offset)
    line = file.readline().strip()
    line = line.decode("utf-8")
    row_data = line.split("|")
    return {
        "doc_id": doc_id,
        "title": row_data[0],
        "abstract": row_data[1],
        "year": row_data[2],
        "keywords": row_data[3],
        "n_citation": row_data[4],
        "url": row_data[5],
    }

def calculate_byte_offset():
    csv_path = "D:\\code\\DSAProject\\reSearch\\cleaned_data_final.csv"
    if not os.path.exists(csv_path):
        return 0
    with open(csv_path, "rb") as f:
        f.seek(0, os.SEEK_END)
        return f.tell()