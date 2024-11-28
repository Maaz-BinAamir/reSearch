import pandas as pd
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer
from forward_index import preprocess
from nltk import pos_tag  # for POS tagging

#Initializing lexicon
lexicon = {}
lemmatizer = WordNetLemmatizer()

csv_path = "D:/Downloads/book1.csv"
data = pd.read_csv(csv_path)
id=1 #id to associate with each word

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

def makeLexicon(tokens):
    #making id global for correct updation
    global id
    for word in tokens:
        # Get POS tag in WordNet format using the helper function
        pos_tagged = pos_tag([word])
            
            # pos_tagged gives [0] the word and [1] the POS tag . e.g for running it would be {[ running , VBG ]}
        wordnet_pos = get_wordnet_pos(pos_tagged[0][1])  # Get POS for the word
            
            # Lemmatize the word using the correct POS tag
        if wordnet_pos:
            lemmatized_word = lemmatizer.lemmatize(word, wordnet_pos)
        else:
            lemmatized_word = lemmatizer.lemmatize(word)  # Default to noun if no valid POS

        #check if word is in lexicon
        if word not in lexicon:
            lexicon[word] = {
                'id': id,
                'frequency': 1,
                'lemma': lemmatized_word
            }
        else:
            #if word already in lexicon, increment its frequency
            lexicon[word]['frequency'] += 1
        id+=1

#Iterate through the data to make lexicon
for _, row in data.iterrows():
    title_tokens = preprocess(row['title'])
    keyword_tokens = preprocess(row['keywords'])

    makeLexicon(title_tokens)
    makeLexicon(keyword_tokens)




    

