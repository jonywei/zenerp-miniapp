<template>
	<view class="content">
		<view class="spacer"></view>
		<view class="logo-box">
			<text class="title">ZenERP</text>
			<text class="sub-title">智能经营管理系统</text>
		</view>
		<view class="form-box">
			<input class="input" v-model="username" placeholder="请输入管理员账号" placeholder-style="color:#bbb" />
			<input class="input" v-model="password" password placeholder="请输入密码" placeholder-style="color:#bbb" />
			<button class="btn" @click="handleLogin" :loading="loading">登 录</button>
            
            <view class="reg-area" @click="goRegister">
                <text class="reg-text">还没有账号？<text class="reg-link">注册新公司</text></text>
            </view>
		</view>
		<view class="spacer"></view>
	</view>
</template>

<script>
	import { request } from '@/common/api.js';

	export default {
		data() { return { username: '', password: '', loading: false } },
		methods: {
			async handleLogin() {
				if (!this.username || !this.password) return uni.showToast({ title: '请填写', icon: 'none' });
				this.loading = true;
				try {
					const res = await request({ url: '/api/login/', method: 'POST', data: { username: this.username, password: this.password } });
					if (res.status === 'ok') {
						uni.setStorageSync('username', this.username);
                        // 🟢 核心修复：保存角色信息！
                        uni.setStorageSync('role', res.role);
                        uni.setStorageSync('tenant_name', res.tenant);
                        
						uni.showToast({ title: '登录成功' });
						setTimeout(() => { uni.reLaunch({ url: '/pages/index/index' }); }, 500);
					} else { uni.showToast({ title: res.msg || '账号错误', icon: 'none' }); }
				} catch (e) {
				} finally { this.loading = false; }
			},
            goRegister() { uni.navigateTo({ url: '/pages/login/register' }); }
		}
	}
</script>

<style>
	.content { height: 100vh; background-color: #fff; padding: 60rpx; display: flex; flex-direction: column; justify-content: center; }
	.spacer { flex: 1; }
	.logo-box { margin-bottom: 80rpx; text-align: center; }
	.title { font-size: 80rpx; font-weight: 900; color: #2563eb; letter-spacing: -2rpx; margin-bottom: 10rpx; display: block; font-family: sans-serif; }
	.sub-title { font-size: 28rpx; color: #94a3b8; letter-spacing: 6rpx; display: block; text-transform: uppercase; font-weight: bold; }
	.form-box { width: 100%; margin-bottom: 100rpx; }
	.input { background-color: #f8fafc; height: 100rpx; border-radius: 50rpx; margin-bottom: 30rpx; padding: 0 40rpx; font-size: 32rpx; color: #333; border: 1px solid #e2e8f0; }
	.btn { background: linear-gradient(90deg, #2563eb, #3b82f6); color: #fff; border-radius: 50rpx; height: 100rpx; line-height: 100rpx; font-size: 36rpx; font-weight: bold; margin-top: 40rpx; box-shadow: 0 10rpx 30rpx rgba(37, 99, 235, 0.3); }
	.btn:active { opacity: 0.9; transform: scale(0.98); }
    .reg-area { margin-top: 40rpx; text-align: center; padding: 20rpx; }
    .reg-text { font-size: 28rpx; color: #64748b; }
    .reg-link { color: #2563eb; font-weight: bold; margin-left: 10rpx; }
</style>