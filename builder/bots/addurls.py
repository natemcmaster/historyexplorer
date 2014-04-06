import psycopg2
import wikisnip
conn = psycopg2.connect('dbname=wgraph user=nmcmaster')
fs = None
with conn.cursor() as cursor:
	cursor.execute('''select name from nodes where sourceurl is null''')
	rs=cursor.fetchall()

with conn.cursor() as cursor:
	for r in rs:
		id = r[0]
		url = wikisnip.geturl(id)
		print (id,url)
		cursor.execute('''update nodes set sourceurl = %s where name = %s''',(url,id))
conn.commit()
