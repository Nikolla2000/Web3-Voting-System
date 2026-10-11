DUPLICATE_CHECK_TOP_K = 5

# Calibrated live against voyage-4-lite: a near-duplicate/close-paraphrase of
# an existing poll scored 0.75-0.76 cosine similarity, an unrelated poll
# scored 0.18. 0.70 sits with margin below the real near-duplicates and far
# above the unrelated case.
DUPLICATE_CHECK_SIMILARITY_THRESHOLD = 0.70

SEARCH_TOP_K = 10
