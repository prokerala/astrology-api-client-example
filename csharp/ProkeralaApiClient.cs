using System;
using System.Collections.Generic;
using System.Text;
using System.IO;
using System.Net;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Web;
using System.Collections.Specialized;

namespace Prokerala.Api
{
	namespace Exception
	{
		using System;

		[Serializable]
		class ApiError : Exception
		{
			private int errorCode;

			public ApiError(string message, int code = 0) : base(message)
			{
				errorCode = code;
			}

			public int GetErrorCode()
			{
				return errorCode;
			}
		}

		class AuthenticationError : ApiError
		{
			public AuthenticationError(string message, int code) : base(message, code)
			{
			}
		}

		class ServerError : ApiError
		{
			public ServerError(string message, int code) : base(message, code)
			{
			}
		}

		class ValidationError : ApiError
		{
			private List<ErrorObject> validationMessages;

			public ValidationError(string message, int code, List<ErrorObject> validationMessages) : base(message, code)
			{
				this.validationMessages = validationMessages;
			}

			public List<ErrorObject> getValidationMessages()
			{
				return validationMessages;
			}
		}

		class ErrorObject
		{
			public string status { get; set; }
			public string title { get; set; }
			public string detail { get; set; }
		}

		class ErrorResponse
		{
			public string id { get; set; }
			public string status { get; set; }
			public List<ErrorObject> errors { get; set; }
		}
	}

	public class Bearer
	{
		public string scope { get; set; }
		public string token_type { get; set; }
		public string expires_in { get; set; }
		public string refresh_token { get; set; }
		public string access_token { get; set; }
	}

	class ApiClient
	{
		public const string BASE_URL = "https://api.prokerala.com/";

		private string clientId;
		private string clientSecret;

		public ApiClient(string clientId, string clientSecret)
		{
			this.clientId = clientId;
			this.clientSecret = clientSecret;
		}

		public object get(string endpoint, NameValueCollection parameters)
		{
			// Try to fetch the access token from cache
			string? token = this.getTokenFromCache();
			if (null == token)
			{
				// If failed, request new token
				token = this.fetchNewToken();
			}

			var uriBuilder = new UriBuilder(ApiClient.BASE_URL + endpoint);
			var query = HttpUtility.ParseQueryString(uriBuilder.Query);

			foreach (string key in parameters)
			{
				query.Add(key, parameters[key]);
			}

			HttpWebResponse res;

			try
			{
				string uri = BASE_URL + endpoint + '?' + query.ToString();
				HttpWebRequest req = WebRequest.Create(uri) as HttpWebRequest;
				req.Accept = "application/json";
				req.Method = "GET";
				req.KeepAlive = false;
				req.Headers.Add("Authorization", "Bearer " + token);

				res = (HttpWebResponse)req.GetResponse();
			}
			catch (System.Net.WebException e)
			{
				res = (HttpWebResponse)e.Response;
			}

			using (var reader = new StreamReader(res.GetResponseStream(), Encoding.UTF8))
			{
				var response = reader.ReadToEnd();

				return this.parseResponse(response, (int)res.StatusCode, res.GetResponseHeader("Content-Type"));
			}
		}

		private void saveToken(string token)
		{
			// TODO: Cache the token until it expires
		}

		private string getTokenFromCache()
		{
			// TODO: Return cached token, if exists
			return null;
		}

		private string fetchNewToken()
		{
			byte[] body = Encoding.ASCII.GetBytes("grant_type=client_credentials&client_id=" + clientId + "&client_secret=" + clientSecret);

			HttpWebResponse res;

			try
			{
				HttpWebRequest req = WebRequest.Create(BASE_URL + "token") as HttpWebRequest;
				req.Accept = "application/json";
				req.Method = "POST";
				req.ContentType = "application/x-www-form-urlencoded";
				req.ContentLength = body.Length;
				req.KeepAlive = false;

				Stream reqStream = req.GetRequestStream();
				reqStream.Write(body, 0, body.Length);


				res = (HttpWebResponse)req.GetResponse();
			}
			catch (System.Net.WebException e)
			{
				res = (HttpWebResponse)e.Response;
			}

			using (var reader = new StreamReader(res.GetResponseStream(), Encoding.UTF8))
			{
				var resBody = reader.ReadToEnd();

				dynamic data = this.parseResponse(resBody, (int)res.StatusCode, res.GetResponseHeader("Content-Type"));

				return (string)data.access_token;
			}
		}

		private object parseResponse(string response, int responseCode, string contentType)
		{
			dynamic res = response;

			int pos = contentType.IndexOf(';');
			if (pos > 0)
			{
				contentType = contentType.Substring(0, pos);
			}

			if ("application/json" != contentType && 200 == responseCode)
			{
				return res;
			}

			if ("application/json" != contentType)
			{
				throw new Exception.ApiError("HTTP request failed");
			}

			if (200 == responseCode)
			{
				return JsonConvert.DeserializeObject<JToken>(res);
			}

			Exception.ErrorResponse errResponse = JsonConvert.DeserializeObject<Exception.ErrorResponse>(res);
			if ("error" != errResponse.status)
			{
				throw new Exception.ApiError("HTTP request failed");
			}

			List<Exception.ErrorObject> errors = errResponse.errors;


			if (400 == responseCode)
			{
				throw new Exception.ValidationError("Validation failed", 400, errors);
			}

			if (401 == responseCode)
			{
				throw new Exception.AuthenticationError(errors[0].detail, 403);
			}

			if (responseCode >= 500)
			{
				throw new Exception.ServerError(errors[0].detail, responseCode);
			}

			throw new Exception.ApiError("Unexpected error");
		}
	}

	class Program
	{
		static void Main(string[] args)
		{
			string clientId = "YOUR_CLIENT_ID";
			string clientSecret = "YOUR_CLIENT_SECRET";


			var client = new ApiClient(clientId, clientSecret);
			var parameters = new NameValueCollection()
			{
				{ "ayanamsa", "1"},
				{ "datetime", "2021-01-01T00:00:00Z" },
				{ "coordinates", "23.1765,75.7885" },
				{ "chart_type", "rasi" },
				{ "chart_style", "north-indian" }
			};

			try
			{
				dynamic data = client.get("v2/astrology/panchang", parameters);

				Console.WriteLine(data.data.nakshatra[0].name);
				Console.WriteLine(data.data.tithi[0].name);
				Console.WriteLine(data.data.yoga[0].name);

				// For v2/astrology/chart endpoint, client.get returns an SVG image as a string
				//var parameters2 = new NameValueCollection()
				//{
				//	{ "ayanamsa", "1"},
				//	{ "datetime", "2021-01-01T00:00:00Z" },
				//	{ "coordinates", "23.1765,75.7885" },
				//	{ "chart_type", "rasi" },
				//	{ "chart_style", "north-indian" }
				//};
				//dynamic chart = client.get("v2/astrology/chart", parameters2);
				//Console.WriteLine(chart);

				Console.Read();
			}
			catch (Exception.ValidationError exception)
			{
				foreach (var err in exception.getValidationMessages())
				{
					Console.WriteLine(err.detail);
				}
			}
			catch (Exception.AuthenticationError err)
			{
				Console.WriteLine(err.Message);
			}
		}
	}
}