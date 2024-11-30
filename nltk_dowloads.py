import nltk

# NLTK resources
# downloading the stop words
nltk.download('stopwords')
# downloading the tokenizer model
nltk.download('punkt')
# downloading wordnet which is used for lemmenization etc
nltk.download('wordnet')
# downloading the open multi-lingual word net for non english languages
nltk.download('omw-1.4')
# downloading the models for parts of speech tagging
nltk.download('averaged_perceptron_tagger_eng')
nltk.download('averaged_perceptron_tagger')