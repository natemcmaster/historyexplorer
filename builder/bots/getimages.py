import wikipedia
import psycopg2, json, sys
conn = psycopg2.connect('dbname=wgraph user=nmcmaster')
fs=None
with conn.cursor() as cursor:
	cursor.execute('''select sourceurl,name from nodes''')
	rs=cursor.fetchall()
	for i in rs:
		url=i[0]
		n=i[1]
		print n
		try:
			p=wikipedia.page(n)
		except:
			try:
				p = wikipedia.page(url)
			except:
				sys.stderr.write(url+'\n')
				continue
		try:		
			summary = p.summary
			js=json.dumps(p.images)
		except:
			sys.stderr.write(url+'\n')
			continue
		print js
		cursor.execute('''update nodes set all_images=%s,description=%s where name = %s''',(js,summary,n))
		conn.commit()
		