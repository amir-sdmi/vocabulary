# Telegram Message Templates

This file defines ready-to-send bot messages for each command and flow.

## 1) `add: <term> | <sentence>`

### Success - card created
```
✅ Saved: *{term}* ({pos})

EN: {definition_easy_en}
FA: {meaning_fa}

Your sentence:
“{user_example}”

Now write *2-3 new sentences* using *{term}*.
Send them in one message (one sentence per line).
```

### Validation error
```
I could not parse that format.
Use:
add: <term> | <sentence>

Example:
add: take over | I took over the project last week.
```

## 2) Sentence evaluation reply

### Per-sentence feedback block
```
Sentence {index}: {score}/100 ({result})
Your sentence: {original}
Fix: {fixed_sentence}
Why (EN): {explanation_en}
توضیح (FA): {explanation_fa}
```

### Final summary (pass)
```
Great work on *{term}*.
Average score: *{score_avg}/100*
Status: *{status}*
Next review: *{next_due_human}*
```

### Final summary (fail)
```
Keep practicing *{term}*.
Average score: *{score_avg}/100*
Status: *trouble*
I will repeat this word again in this session or tomorrow.
```

## 3) `review`

### Start session
```
📘 Daily Review Started
Today's target: *{count} words*

Type your sentence for:
*{term}* ({pos})
Hint: {definition_easy_en}
```

### Next word
```
Next word ({current}/{total}):
*{term}* ({pos})
Hint: {definition_easy_en}
```

### End session
```
✅ Daily Review Complete
Words reviewed: *{total}*
Average score: *{daily_score}/100*
Trouble words: {trouble_terms_csv}

Come back tomorrow for your next 10-word session.
```

## 4) `dict` and filters

### `dict`
```
📚 Your dictionary ({count} words)

{rows}

Use:
- dict #work
- dict trouble
- search: <query>
```

`{rows}` format:
```
{index}) {term} ({pos}) - {status} - #{tags}
```

### `dict #tag`
```
🏷️ Tag: #{tag}
Found: *{count}* words

{rows}
```

### `dict trouble`
```
⚠️ Trouble Words ({count})
{rows}
```

## 5) `search: <query>`
```
🔎 Search: "{query}"
Found: *{count}* matches

{rows}
```

## 6) `stats`
```
📊 Your stats

Total words: {total_words}
Known: {known_count}
Learning: {learning_count}
Trouble: {trouble_count}
Reviews (7d): {reviews_7d}
Avg score (7d): {avg_score_7d}/100
Current streak: {streak_days} days
```

## 7) Reminder message (daily cron)
```
⏰ Time for today's vocabulary session.
You have *{due_count}* due words.
Type *review* to start (10 words).
```
