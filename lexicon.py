import pandas as pd
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer
from forward_index import preprocess
# for removing stop words
from nltk.corpus import stopwords 
# for POS tagging
from nltk import pos_tag  

#Initializing lexicon
lexicon = {}
lemmatizer = WordNetLemmatizer()

csv_path = "D:/Downloads/book1.csv"
data = pd.read_csv(csv_path)

data['keywords'] = data['keywords'].apply(preprocess)
data['title'] = data['title'].apply(preprocess)
data['abstract'] = data['abstract'].apply(preprocess)

#id to associate with each word
id=1 

# Function to map POS tags from Penn Treebank format to WordNet format
# for identifying whether its a noun , verb , adverb or adjective
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
    stop_words = set(stopwords.words('english')) # for removal of stop words 

    # Tokenize text into words
    tokens = word_tokenize(text)

    # Process each token explicitly
    processed_tokens = []
    
    for word in tokens:
        # Convert the word to lowercase
        lowercased_word = word.lower()
        
        # Checks if the word is alphanumeric, not a stopword, and greater than 2 characters
        if lowercased_word.isalnum() and lowercased_word not in stop_words and len(lowercased_word) > 2:
            processed_tokens.append(lowercased_word)

    return processed_tokens

def makeLexicon(tokens):
    # using the id assigned outside the function
    global id
    
    for word in tokens:
        # Get POS tag in WordNet format using the helper function
        pos_tagged = pos_tag([word])
            
        # pos_tagged gives [0] the word and [1] the parts of speech tag.
        wordnet_pos = get_wordnet_pos(pos_tagged[0][1])
            
        # Lemmatize the word using the correct POS tag
        if wordnet_pos:
            lemmatized_word = lemmatizer.lemmatize(word, wordnet_pos)
        else:
            # Default to noun if no valid POS
            lemmatized_word = lemmatizer.lemmatize(word)

        #check if word is in lexicon
        if word not in lexicon:
            lexicon[word] = id
            id += 1
            
        #check if lemmatized_word is in lexicon
        if lemmatized_word not in lexicon:
            lexicon[lemmatized_word] = id
            id += 1

#Iterate through the data to make lexicon
for _, row in data.iterrows():
    makeLexicon(row['title'] + row['keywords'] + row['abstract'])