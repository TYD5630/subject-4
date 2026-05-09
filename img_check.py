import json
d = json.load(open(r'D:\科目四训练\public\questions.json', 'r', encoding='utf-8'))

ch2 = [q for q in d if q['chapter'] == 2]
ch3 = [q for q in d if q['chapter'] == 3]
ch4 = [q for q in d if q['chapter'] == 4]

sign_keywords = ['标志', '手势', '标线', '信号灯', '指示灯', '交警', '箭头']
sign_qs = []
for q in d:
    for kw in sign_keywords:
        if kw in q['question']:
            sign_qs.append(q)
            break

print(f"Ch2 (交通信号): {len(ch2)} questions")
print(f"Ch3 (恶劣天气): {len(ch3)} questions")
print(f"Ch4 (复杂道路): {len(ch4)} questions")
print(f"\nQuestions mentioning signs/gestures: {len(sign_qs)}")

imgs = [q for q in d if q.get('image') is not None]
blank_imgs = [q for q in d if 'image' in q and not q.get('image')]
print(f"Has image field: {len(imgs)}")
print(f"Has blank image field: {len(blank_imgs)}")
print(f"No image field: {len(d) - len(imgs)}")
