# On your command window , run pip install pandas nltk to download the external libraries

import pandas as pd # Used for loading the dataset into the data frame for the preprocessing
import nltk # Used for token normalization
import json  # For saving and managing large forward indices
from nltk.corpus import stopwords # for removing stop words
from nltk.tokenize import word_tokenize # for tokenization 
from collections import Counter  # an efficient way to count word frequencies


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
            processed_tokens.append(lowercased_word)

    return processed_tokens

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
