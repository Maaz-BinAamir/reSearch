from lexicon import lexicon
from forward_index import forward_index

inverted_index = {}

# TODO: do something so that root word queries give derative results as well
for word, word_id in lexicon.items():
    for doc_id, word_count in forward_index.items():
        if word_id in word_count:
            if doc_id not in inverted_index:
                inverted_index[doc_id] = [word_id]
            else:
                inverted_index[doc_id].append(word_id)