using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using PersonalExpenseTracker.Models;
using backend.Data;
using PersonalExpenseTracker.DTOs;

namespace PersonalExpenseTracker.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly PasswordHasher<User> _passwordHasher;

        public AuthController(
            AppDbContext context,
            IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
            _passwordHasher = new PasswordHasher<User>();
        }

        // REGISTER
        [HttpPost("register")]
        public async Task<IActionResult> Register(
            Register request)
        {
            var username = request.Username.Trim();

            if (await _context.Users.AnyAsync(
                u => u.Username.ToLower() == username.ToLower()))
            {
                return BadRequest(new
                {
                    message = "Username already exists."
                });
            }

            var user = new User
            {
                Username = username
            };

            user.PasswordHash =
                _passwordHasher.HashPassword(user, request.Password);

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Account created successfully."
            });
        }

        // LOGIN
        [HttpPost("login")]
        public async Task<IActionResult> Login(Login request)
        {
            var username = request.Username.Trim();

            var user = await _context.Users.FirstOrDefaultAsync(
                u => u.Username.ToLower() == username.ToLower());

            if (user == null)
            {
                return Unauthorized(new
                {
                    message = "Invalid username or password."
                });
            }

            var result = _passwordHasher.VerifyHashedPassword(
                user,
                user.PasswordHash,
                request.Password
            );

            if (result == PasswordVerificationResult.Failed)
            {
                return Unauthorized(new
                {
                    message = "Invalid username or password."
                });
            }

            var token = GenerateToken(user);

            return Ok(new
            {
                token,
                user = new
                {
                    user.Id,
                    user.Username
                }
            });
        }

        // GET LOGGED-IN USER PROFILE
        [HttpGet("profile")]
        [Microsoft.AspNetCore.Authorization.Authorize]
        public async Task<IActionResult> GetProfile()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (!int.TryParse(userId, out int id))
            {
                return Unauthorized();
            }

            var user = await _context.Users
                .Where(u => u.Id == id)
                .Select(u => new
                {
                    u.Id,
                    u.Username,
                    u.CreatedAt
                })
                .FirstOrDefaultAsync();

            if (user == null)
            {
                return NotFound();
            }

            return Ok(user);
        }

        // GENERATE JWT
        private string GenerateToken(User user)
        {
            var jwtSettings = _configuration.GetSection("Jwt");

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(
                    jwtSettings["Key"]!
                )
            );

            var credentials = new SigningCredentials(
                key,
                SecurityAlgorithms.HmacSha256
            );

            var claims = new[]
            {
                new Claim(
                    ClaimTypes.NameIdentifier,
                    user.Id.ToString()
                ),
                new Claim(
                    ClaimTypes.Name,
                    user.Username
                )
            };

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(
                    double.Parse(jwtSettings["ExpiryMinutes"]!)
                ),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler()
                .WriteToken(token);
        }
    }
}
