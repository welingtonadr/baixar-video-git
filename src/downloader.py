import yt_dlp, sys

def baixar(url):
    ydl_opts = {
        'outtmpl': 'downloads/%(uploader)s/%(title)s.%(ext)s',
        'format': 'bestvideo+bestaudio/best',
        # 'cookiefile': 'cookies.txt',  # descomente se precisar de login
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([url])

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Uso: python downloader.py <URL1> <URL2> ...")
        sys.exit(1)
    for link in sys.argv[1:]:
        print(f"🔎 Baixando {link}")
        baixar(link)
        print("✅ Concluído\n")
