using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WorldGraph.GraphStorage
{
    public interface IGraphStorage
    {

        bool TagExists(string tag);

        void AddTag(string tag);

        IList<Tag> GetAllTags();
    }
}
