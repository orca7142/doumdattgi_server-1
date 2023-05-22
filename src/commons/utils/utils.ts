export function getToday() {
  const aaa = new Date();
  const yyyy = aaa.getFullYear();
  const mm = aaa.getMonth() + 1;
  const dd = aaa.getDate();
  const today = `${yyyy}-${mm}-${dd}`;
  return today;
}

export function welcomeTemplate({ email, name }) {
  const template = `
	<html>
			<body>
					<div style="display: flex; flex-direction: column; align-items: center;">
					<div style="width: 500px;">
							<h1>${name}님 가입을 환영합니다!</h1>
							<hr />
							<div style="color: black;">이름: ${name}</div>
							<div>email: ${email}</div>
							<div>가입일: ${getToday()}</div>
					</div>
					</div>
			</body>
	</html>
	`;
  return template;
}

export function sendTokenTemplate({ token }) {
  const template = `
	<!DOCTYPE html>
	<html lang="ko">
		<head>
			<title>도움닫기</title>
		</head>
		<body id="box1"></body>
			<table style="width: 100%;">
					<tbody>
							<tr>
									<td style="text-align: center;">
											<h1>도움닫기</h1>
									</td>
							</tr>
							<tr>
									<td style="text-align: center;">
											<h2>[도움닫기]인증번호를 안내해드립니다.</h2>
									</td>
							</tr>
							<tr>
									<td style="text-align: center;">
											<div id="box2">
													<div style="font-size: 32px; color: #ABABAB; width: 100%;"> 인증번호: ${token}</div>
											</div>
									</td>
							</tr>
					</tbody>
			</table>
		</body>
	</html>		
	`;
  return template;
}

export function welcomeTemplateSMS({ name, phone, prefer }) {
  const myTemplate = `
		<html>
			<body>
			  <div style="display: flex; flex-direction: column; align-items: center;">
				<div style="width: 500px;">
				  <h1>${name}님 가입을 환영합니다!!!</h1>
				  <hr />
				  <div>이름: ${name}</div>
				  <div>전화번호: ${phone}</div>
				  <div>좋아하는 사이트: ${prefer}</div>
				  <div>가입일: ${getToday()}</div>
				</div>
			  </div>
			</body>
		</html>
	`;
  // console.log(myTemplate);
  return myTemplate;
}
