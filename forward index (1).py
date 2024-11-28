# On your command window , run pip install pandas nltk to download the external libraries

import pandas as pd # Used for loading the dataset into the data frame for the preprocessing
import nltk # Used for token normalization
import json  # For saving and managing large forward indices

from nltk.corpus import stopwords # for removing stop words
from nltk.tokenize import word_tokenize # for tokenization 
from nltk.stem import WordNetLemmatizer # for lemmetization 
from collections import Counter  # an efficient way to count word frequencies
from nltk import pos_tag  # for POS tagging

# NLTK resources for normalization , only done when running the code first time , you can remove the nltk resources after running it for the first time
nltk.download('stopwords')
nltk.download('punkt')
nltk.download('wordnet')
nltk.download('omw-1.4')
nltk.download('averaged_perceptron_tagger_eng')  # Add this to ensure POS tagging works
nltk.download('averaged_perceptron_tagger')

# Loading the dataset
csv_path = "D:/Downloads/book1.csv"
data = pd.read_csv(csv_path)

# Preprocessing function for token normalization
def preprocess(text):
    
    stop_words = set(stopwords.words('english')) # for removal of stop words 
    lemmatizer = WordNetLemmatizer() # for lemmetization

    if pd.isnull(text):  # Handle missing text
        return []

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
            pos_tagged = pos_tag([word])
            
            # pos_tagged gives [0] the word and [1] the POS tag . e.g for running it would be {[ running , VBG ]}
            wordnet_pos = get_wordnet_pos(pos_tagged[0][1])  # Get POS for the word
            
            # Lemmatize the word using the correct POS tag and add it to the list
            if wordnet_pos:
                lemmatized_word = lemmatizer.lemmatize(lowercased_word, wordnet_pos)
            else:
                lemmatized_word = lemmatizer.lemmatize(lowercased_word)  # Default to noun if no valid POS
            
            processed_tokens.append(lemmatized_word)

    return processed_tokens

# Function to map POS tags from Penn Treebank format to WordNet format

def get_wordnet_pos(treebank_tag): # for identifying whether its a noun , verb , adverb or adjective
    #Converts POS tag from Penn Treebank format to WordNet format
    
    if treebank_tag.startswith('J'):
        return 'a'  # adjective
    elif treebank_tag.startswith('V'):
        return 'v'  # verb
    elif treebank_tag.startswith('N'):
        return 'n'  # noun
    elif treebank_tag.startswith('R'):
        return 'r'  # adverb
    else:
        return None  # for unknown or other tags

# Combine title and abstract that requires preprocessing
data['text'] = data['title'] + " " + data['abstract']

# Applyng preprocessing in batches to handle large datasets efficiently
# Instead of row-by-row operations, this leverages pandas' `apply` for performance
data['processed_text'] = data['text'].apply(preprocess)

# Initialize the forward index as a dictionary for mapping 
forward_index = {}

# Building the forward index
for index, row in data.iterrows():
    
    # Using the counter to count word frequencies efficiently
    word_counts = Counter(row['processed_text'])
    forward_index[index] = word_counts


# Save the forward index to a JSON file for persistence and handling large data
# JSON is suitable for saving large dictionaries as text files

# with open("forward_index.json", "w") as file:
# json.dump(forward_index, file)


# Display a limited number of forward index entries (first 5 documents)
'''for i, (doc_id, word_freq) in enumerate(forward_index.items()):
    if i >= 5:  # Limit the display to the first 5 documents
        break
    print("Document ID:", doc_id)
    print("Word Frequencies:", word_freq)
    print("-" * 40)  # Separator for readability
'''

# Display the forward index for the entire dataset
'''for doc_id, word_freq in forward_index.items():
    print("Document ID:", doc_id)
    print("Word Frequencies:", word_freq)
    print("-" * 100)  
'''
