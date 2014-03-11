using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Configuration;

namespace WorldGraph.GraphStorage
{
    public class SQLGraphStorage : IGraphStorage
    {
        private SQLGraphProviderDataContext db;

        public SQLGraphStorage()
        {
            var conn = ConfigurationManager.ConnectionStrings["DefaultConnection"];
            db = new SQLGraphProviderDataContext(connection: conn.ConnectionString);
        }

        public bool TagExists(string tag)
        {
            return 0 < db.Tags.Count(s => s.Value.ToLower().Equals(tag));
        }

        public void AddTag(string tag)
        {
            var t = new Tag { Value = tag };
            db.Tags.InsertOnSubmit(t);
            try
            {
                db.SubmitChanges();
            }
            catch (Exception e)
            {
                throw new GraphStorageException(e);
            }
        }


        public IList<Tag> GetAllTags()
        {
            return db.Tags.AsQueryable().OrderBy(s=>s.Value).ToList();
        }
    }
}
