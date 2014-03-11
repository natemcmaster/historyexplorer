using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using WorldGraph.GraphStorage;

namespace WorldGraph.Controllers
{
    public class CreatorController : ApiController
    {
        private IGraphStorage model;

        public CreatorController(IGraphStorage model)
        {
            this.model = model;
        }


        [HttpPut]
        [Route("api/tag/add/{tag}")]
        public bool InsertTag(string tag)
        {
            if (model.TagExists(tag))
                return false;
            else
            {
                model.AddTag(tag);
                return true;
            }
        }
    }
}
