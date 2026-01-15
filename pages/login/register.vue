<template>
	<view class="content">
		<view class="header">
			<text class="title">注册新公司</text>
			<text class="sub-title">用户入驻申请</text>
		</view>
		<view class="form-card">
			<input class="input" v-model="form.company_name" placeholder="公司/团队名称" />
			<input class="input" v-model="form.name" placeholder="负责人姓名" />
			<input class="input" v-model="form.phone" type="number" placeholder="手机号 (作为登录账号)" />
			<input class="input" v-model="form.password" password placeholder="设置登录密码" />
			<button class="btn" @click="submit" :loading="loading">提交申请</button>
		</view>
		<view class="footer" @click="goLogin">
			<text class="link">已有账号？去登录</text>
		</view>
	</view>
</template>

<script>
	import { request } from '@/common/api.js';
	export default {
		data() {
			return {
				loading: false,
				form: { company_name: '', name: '', phone: '', password: '' }
			}
		},
		methods: {
			async submit() {
				if(!this.form.company_name || !this.form.phone || !this.form.password) return uni.showToast({title:'请填写完整', icon:'none'});
				this.loading = true;
				try {
					const res = await request({ url: '/api/register/', method: 'POST', data: this.form });
					if(res.status === 'ok') {
						uni.showModal({
							title: '注册成功',
							content: '您的申请已提交，请联系管理员审核。审核通过后即可登录。',
							showCancel: false,
							success: () => { this.goLogin(); }
						});
					} else {
						uni.showToast({title: res.msg, icon:'none'});
					}
				} catch(e) {} finally { this.loading = false; }
			},
			goLogin() { uni.navigateBack(); }
		}
	}
</script>

<style>
	.content { height: 100vh; background-color: #f8fafc; padding: 60rpx; display: flex; flex-direction: column; justify-content: center; }
	.header { margin-bottom: 60rpx; text-align: center; }
	.title { font-size: 48rpx; font-weight: 900; color: #1e293b; display: block; margin-bottom: 10rpx; }
	.sub-title { font-size: 28rpx; color: #94a3b8; }
	.form-card { background-color: #fff; padding: 40rpx; border-radius: 30rpx; box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.05); }
	.input { height: 100rpx; background-color: #f1f5f9; border-radius: 16rpx; margin-bottom: 30rpx; padding: 0 30rpx; font-size: 30rpx; }
	.btn { height: 100rpx; line-height: 100rpx; background-color: #2563eb; color: #fff; border-radius: 16rpx; font-size: 34rpx; font-weight: bold; margin-top: 20rpx; }
	.footer { margin-top: 40rpx; text-align: center; }
	.link { color: #2563eb; font-size: 28rpx; font-weight: bold; }
</style>