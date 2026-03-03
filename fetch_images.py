import urllib.request
import json
import urllib.parse
import os

books = [
    {"tit": "Yanlış Numara", "aut": "C. R. Jane", "id": "64"},
    {"tit": "Seni Affetmiyorum", "aut": "Zeus Kabadayı", "id": "65"},
    {"tit": "Elveda", "aut": "Furkan Arslantaş", "id": "66"},
    {"tit": "Beni Yarım Bıraktın", "aut": "Zeus Kabadayı", "id": "67"},
    {"tit": "Henüz Her Şey Bitmedi", "aut": "Zeus Kabadayı", "id": "68"},
    {"tit": "Bana Seni Seviyorum Deme Evlen", "aut": "Miraç Çağrı", "id": "69"},
]

for b in books:
    query = f'intitle:"{b["tit"]}" inauthor:"{b["aut"]}"'
    url = f'https://www.googleapis.com/books/v1/volumes?q={urllib.parse.quote(query)}'
    try:
        req = urllib.request.urlopen(url)
        data = json.loads(req.read().decode('utf-8'))
        if 'items' in data and len(data['items']) > 0:
            volumeInfo = data['items'][0]['volumeInfo']
            img_url = volumeInfo.get('imageLinks', {}).get('thumbnail')
            if img_url:
                img_url = img_url.replace('http:', 'https:')
                output_path = f'./images/harytlar/{b["id"]}.jpg'
                urllib.request.urlretrieve(img_url, output_path)
                print(f'Downloaded {b["tit"]} to {output_path}')
            else:
                print(f'No image found for {b["tit"]} in volumeInfo')
        else:
            print(f'No items found for {b["tit"]}')
    except Exception as e:
        print(f'Error for {b["tit"]}: {e}')

