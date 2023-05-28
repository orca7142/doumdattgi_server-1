export function getToday() {
  const aaa = new Date();
  const yyyy = aaa.getFullYear();
  const mm = aaa.getMonth() + 1;
  const dd = aaa.getDate();
  const today = `${yyyy}-${mm}-${dd}`;
  return today;
}

export function sendTokenTemplate({ token }) {
  const template = `
  <!DOCTYPE html>
  <html lang="ko">
	<head>
	  <title>Document</title>
	</head>
	<body>
	  <div
		style="
		  width: 775px;
		  padding: 80px;
		  background-color: #fafafa;
		  margin: 0;
		  box-sizing: border-box;
		"
	  >
		<p
		  style="
			font-size: 36px;
			color: #111;
			padding-bottom: 30px;
			font-weight: bold;
			margin: 0;
		  "
		>
		</p>
		<p style="font-size: 18px; color: #111; padding-bottom: 30px; margin: 0">
		  [도움닫기]인증번호를 안내해드립니다.
		</p>
		<div
		  style="
			background-color: #88b04b;
			padding: 30px 56px;
			margin: 0 0 70px 0;
			box-sizing: border-box;
		  "
		>
		  <p
			style="
			  font-size: 48px;
			  color: #fff;
			  font-weight: bold;
			  margin: 0;
			  text-align: center;
			"
		  >
			${token}
		  </p>
		</div>
	  </div>
	</body>
  </html>
  `;
  return template;
}

export function sendRequestTemplate({
  seller_nickname,
  buyer_nickname,
  product_title,
}) {
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
											  <h2>[도움닫기] ${seller_nickname}님 "${product_title}" 상품에 대한 ${buyer_nickname}의 의뢰서 요청에 대해 안내해드립니다.</h2>
									  </td>
							  </tr>
							  <tr>
									  <td style="text-align: center;">
											  <div id="box2">
													  <div style="font-size: 32px; color: #ABABAB; width: 100%;"> 수락 또는 거절을 해주세요</div>
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
