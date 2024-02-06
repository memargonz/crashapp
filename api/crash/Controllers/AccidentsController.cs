using Crash.Models.Dtos;
using Crash.Queries;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Crash.Controllers
{
   [Route("api/[controller]")]
   [ApiController]
   public class AccidentsController : ControllerBase
   {
      private readonly IMediator _mediatr;

      public AccidentsController(IMediator meaditr)
      {
         _mediatr = meaditr;
      }

      [HttpGet]
      public async Task<List<AccidentDto>> GetAccidentsAsync()
      {
         var accidents = await _mediatr.Send(new GetAccidentsQuery());

         return accidents;
      }
   }
}
