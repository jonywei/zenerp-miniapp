// 🟢 切换为新域名
const BASE_URL = 'https://a.corezen.site';

export const request = (options) => {
	return new Promise((resolve, reject) => {
		// 1. 取出本地存的 Session ID 和 CSRF Token
		const sessionId = uni.getStorageSync('sessionid');
		const csrfToken = uni.getStorageSync('csrftoken');
		
		// 2. 组装 Cookie 字符串
		let cookieStr = '';
		if (sessionId) cookieStr += `sessionid=${sessionId}; `;
		if (csrfToken) cookieStr += `csrftoken=${csrfToken}; `;
		
		uni.request({
			url: BASE_URL + options.url,
			method: options.method || 'GET',
			data: options.data || {},
			header: {
				'content-type': 'application/json',
				'Cookie': cookieStr,
				'X-CSRFToken': csrfToken // 核心修复：防止 403 Forbidden
			},
			success: (res) => {
				// 3. 智能抓取 Cookie
				const cookies = res.header['Set-Cookie'] || res.header['set-cookie'];
				if (cookies) {
					const sessionMatch = cookies.match(/sessionid=(.*?)(;|$)/);
					if (sessionMatch && sessionMatch[1]) uni.setStorageSync('sessionid', sessionMatch[1]);
					
					const csrfMatch = cookies.match(/csrftoken=(.*?)(;|$)/);
					if (csrfMatch && csrfMatch[1]) uni.setStorageSync('csrftoken', csrfMatch[1]);
				}
				
				// 4. 状态码处理
				if (res.statusCode === 200 || res.statusCode === 201) {
					resolve(res.data);
				} 
				else if (res.statusCode === 401 || res.statusCode === 403) {
					if (options.url.includes('/api/login')) {
						reject(res);
						return;
					}
					uni.showToast({ title: '登录失效', icon: 'none' });
					setTimeout(() => {
						uni.removeStorageSync('sessionid');
						uni.removeStorageSync('csrftoken');
						uni.reLaunch({ url: '/pages/login/login' });
					}, 1500);
					reject(res);
				} 
				else {
					let msg = '系统繁忙';
					if (res.data && (res.data['detail'] || res.data['msg'])) msg = res.data['detail'] || res.data['msg'];
					else if (res.data && res.data['error']) msg = res.data['error'];
					uni.showToast({ title: msg, icon: 'none' });
					reject(res);
				}
			},
			fail: (err) => {
				uni.showToast({ title: '网络连接失败', icon: 'none' });
				reject(err);
			}
		});
	});
}