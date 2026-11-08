"""SRT/VTT/JSON -> word timestamps.
Accepts:
- transcript.srt / transcript.vtt (character-spread estimate)
- words.json / manifest.json (exact sub-millisecond timestamps from harvest voice engine)
usage: python3 words.py transcript.srt|words.json > words.txt"""
import json, re, sys

if len(sys.argv) < 2:
    sys.exit("usage: python3 words.py transcript.srt|words.json > words.txt")

arg = sys.argv[1]
if arg.endswith('.json'):
    data = json.load(open(arg, encoding='utf-8-sig'))
    words_list = data.get('words', data) if isinstance(data, dict) else data
    out = []
    if isinstance(words_list, list):
        for w in words_list:
            if not isinstance(w, dict):
                continue
            word_str = str(w.get('word') or w.get('token') or w.get('text') or '').strip()
            if not word_str:
                continue
            sec = w.get('startMs', 0) / 1000.0 if 'startMs' in w else w.get('startFrame', 0) / 60.0
            out.append(f"{sec:.2f}:{word_str}")
    if out:
        print(' '.join(out))
        sys.exit(0)
    sys.exit(f'words.py: no words found in JSON {arg}')

def ts(x):  # SRT hh:mm:ss,mmm or VTT [hh:]mm:ss.mmm
    return sum(float(v)*60**i for i,v in enumerate(reversed(x.strip().replace(',','.').split(':'))))
cues=0
for blk in re.split(r'\n\s*\n',open(arg,encoding='utf-8-sig').read().strip()):
    L=blk.strip().split('\n')
    i=next((i for i,l in enumerate(L[:2]) if '-->' in l),None)  # SRT has an index line first, VTT may not
    if i is None: continue  # WEBVTT header, NOTE/STYLE blocks
    a,b=[ts(x.split()[0]) for x in L[i].split('-->')]  # drop VTT cue settings after the end time
    words=re.sub(r'<[^>]*>','',' '.join(L[i+1:])).split()  # strip <i>, <c>, <00:00:01.500> tags
    if not words: continue
    n=sum(len(w)+1 for w in words); c=0; out=[]
    for w in words: out.append(f'{a+(b-a)*c/n:.2f}:{w}'); c+=len(w)+1
    print(' '.join(out)); cues+=1
if not cues: sys.exit(f'words.py: no cues found in {arg} (expected SRT or VTT)')
