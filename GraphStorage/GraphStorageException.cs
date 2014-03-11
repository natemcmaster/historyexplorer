using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WorldGraph.GraphStorage
{
    public class GraphStorageException : Exception
    {
        public GraphStorageException(string m) : base(m) { }
        public GraphStorageException(string m, Exception e) : base(m, e) { }
        public GraphStorageException(Exception e) : base("Storage failed",e) { }
    }
}
