import psycopg2
import wikisnip
import fileinput, traceback, sys

class Creator(object):
	"""docstring for Creator"""
	def __init__(self):
		self.conn = psycopg2.connect('dbname=wgraph user=nmcmaster')

	def create_record(self,name,description,start=None,end=None):
		with self.conn.cursor() as cursor:
			cursor.execute('''INSERT INTO nodes 
			            (name,description,timespan_start,timespan_end) 
			            VALUES (%s,%s,%s,%s)
			            RETURNING id''',
			            (name,description,start,end))
			id=cursor.fetchone()[0]
			self.conn.commit()
			return id

	def get_values(self):
		name=raw_input('Name: ')
		(title,d) = wikisnip.firstline(name)
		print d
		use_d = raw_input('Use this description? [Y/n] ')
		description = '';
		if len(use_d) == 0 or use_d.lower().find('y') >= 0:
			description = d
		else:
			description=raw_input('Description: ')
		s=raw_input('Year Start: ')
		e=raw_input('Year End: ')
		s = int(s) if s != None else None
		e = int(e) if e != None else None
		id = self.create_record(name,description,s,e)
		print 'Created new record id #%d' % id
		cont = raw_input('More? [Y/n] ')
		return len(cont) == 0 or cont.lower().find('y') >= 0

	def has_title(self,title):
		with self.conn.cursor() as cursor:
			cursor.execute('SELECT COUNT(*) FROM nodes WHERE name = %s',(title,))
			count = int(cursor.fetchone()[0])
			return count > 0

	def load_default(self,title):
		try:
			print 'Searching %s' % title
			(t,d)=wikisnip.firstline(title)
			if not t or not d or len(d) == 0:
				print 'No description found'
				return -1
			if self.has_title(t):
				print 'Already has %s' % t;
				return -1
			id = self.create_record(t,d)
			print 'Created new record id \'%s\' #%d' % (t,id)
			return True
		except Exception as e:
			print 'Error',e
			traceback.print_exc(file=sys.stdout)
			return False;


	def run(self):
		cont=1
		for line in fileinput.input():
			if self.load_default(line.strip()) == False:
				break;
			cont +=1

		# while self.get_values():
		# 	cont+=1
		# 	pass
		print 'Created %d records' % cont
		self.conn.close()
		pass

if __name__ == '__main__':
	c=Creator()
	c.run()