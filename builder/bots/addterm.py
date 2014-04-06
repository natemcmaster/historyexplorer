import wikipedia
import psycopg2, json
import sys
conn = psycopg2.connect('dbname=wgraph user=nmcmaster')
def insert(title):
	try:
		p = wikipedia.page(title)
		print 'Found %s (%s)' %(p.title,p.url)
	except:
		return 'Could not find %s' % title
	r=raw_input('Insert? [n/Y] ')
	if r.lower() == 'n':
		return 'Not inserted'
	with conn.cursor() as cursor:
		try:
			cursor.execute('''insert into nodes (name,source,sourceurl,all_images,description)
		               values (%s,%s,%s,%s,%s)''',(p.title,'Wikipedia.org',p.url,json.dumps(p.images),p.summary))
		except Exception as e:
			print e
			return 'Could not insert'
		conn.commit()
	return 'Inserted' 

while True:
	t = raw_input('Title? ')
	if len(t) == 0:
		break
	print insert(t)
