import time
import pandas as pd
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer
from nltk import pos_tag  
from nltk.corpus import stopwords

lemmatizer = WordNetLemmatizer()

# Loading the dataset into panda's data frame, first 500 rows
csv_path = "exported_data.csv"
data = pd.read_csv(csv_path).head(500)

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
    tokens = word_tokenize(text)

    # Process each token explicitly
    processed_tokens = []
    
    for word in tokens:
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

    return " ".join(processed_tokens)


data['title'] = data['title'].apply(preprocess)
data ['abstract'] = data['abstract'].apply(preprocess)
data ['keywords'] = data['keywords'].apply(lambda x: " ".join((eval(x))))

columns_to_output = ['title', 'abstract', 'keywords']

data[columns_to_output].to_csv('processed_text.csv', index=False)