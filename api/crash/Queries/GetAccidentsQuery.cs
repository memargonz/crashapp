using Crash.Models.Dtos;
using MediatR;

namespace Crash.Queries;
public class GetAccidentsQuery : IRequest<List<AccidentDto>> {

}