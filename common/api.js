const BASE_URL = 'https://erp.corezen.site';

export const request = (options) => {
	return new Promise((resolve, reject) => {
		// 1. 取出本地存的 Session ID 和 CSRF Token
		const sessionId = uni.getStorageSync('sessionid');
		const csrfToken = uni.getStorageSync('csrftoken');
		
		// 2. 组装 Cookie 字符串 (Django 要求 Cookie 里必须有 csrftoken)
		let cookieStr = '';
		if (sessionId) cookieStr += `sessionid=${sessionId}; `;
		if (csrfToken) cookieStr += `csrftoken=${csrfToken}; `;
		
		uni.request({
			url: BASE_URL + options.url,
			method: options.method || 'GET',
			data: options.data || {},
			header: {
				'content-type': 'application/json',
				'Cookie': cookieStr, // 身份证 + 密语
				'X-CSRFToken': csrfToken // ⚠️ 核心修复：必须在头里单独再发一次密语
			},
			success: (res) => {
				// 3. 智能抓取 Cookie (登录或任何响应头里更新了 Cookie 时)
				const cookies = res.header['Set-Cookie'] || res.header['set-cookie'];
				if (cookies) {
					// 抓取 sessionid
					const sessionMatch = cookies.match(/sessionid=(.*?)(;|$)/);
					if (sessionMatch && sessionMatch[1]) {
						uni.setStorageSync('sessionid', sessionMatch[1]);
						console.log('SessionID 更新');
					}
					
					// ⚠️ 抓取 csrftoken
					const csrfMatch = cookies.match(/csrftoken=(.*?)(;|$)/);
					if (csrfMatch && csrfMatch[1]) {
						uni.setStorageSync('csrftoken', csrfMatch[1]);
						console.log('CSRF Token 更新');
					}
				}
				
				// 4. 状态码处理
				// 成功 (200 OK 或 201 Created)
				if (res.statusCode === 200 || res.statusCode === 201) {
					resolve(res.data);
				} 
				// 认证失败 (403 通常就是 CSRF 校验失败，或者权限不足)
				else if (res.statusCode === 401 || res.statusCode === 403) {
					console.error('权限验证失败:', res);
					
					// 为了防止无限循环，这里加个判断：如果是登录接口本身报403，那是账号密码错，不跳
					if (options.url.includes('/api/login')) {
						reject(res);
						return;
					}

					uni.showToast({ title: '登录状态失效，请重登', icon: 'none', duration: 2000 });
					setTimeout(() => {
						uni.removeStorageSync('sessionid');
						uni.removeStorageSync('csrftoken'); // 清空脏数据
						uni.reLaunch({ url: '/pages/login/login' });
					}, 1500);
					reject(res);
				} 
				// 其他错误
				else {
					let msg = '系统繁忙';
					if (res.data && (res.data['detail'] || res.data['msg'])) {
						msg = res.data['detail'] || res.data['msg'];
					} else if (res.data && res.data['error']) {
						msg = res.data['error'];
					}
					uni.showToast({ title: msg, icon: 'none', duration: 3000 });
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