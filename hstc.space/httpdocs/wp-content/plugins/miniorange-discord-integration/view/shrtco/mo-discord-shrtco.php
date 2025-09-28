<?php
/**
 * Discord Shortcode.
 *
 * @package MO_DISCORD_INTEGRATOR
 */

/**
 * Discord shortcode.
 *
 * @return void
 */
function mo_discord_login_shortcodes() {
	?>
	<div class="mo_discord_table_layout">
		<table>
			<tr>
				<td>
					<div id="mo_discord_login_shortcode" style="font-size:13px !important">
						<h4>Use discord login Shortcode in the content of required page/post where you want to display Discord Login Icons.</h4>
						<h3>Default Discord Login Shortcode</h3>
						This will display Discord Login Icons with same default settings<br/>
						<code id='1'>[miniorange_discord_login]</code><i style= "width: 11px;height: 9px;padding-left:2px;padding-top:3px" class="far fa-fw fa-lg fa-copy mo_discord_copy mo_discord_copytooltip" onclick="copyToClipboard(this, '#1', '#shortcode_url_copy')"><span id="shortcode_url_copy" class="mo_discord_copytooltiptext">Copy to Clipboard</span></i><hr>

						<h3>For Icons</h3>
						You can use  different attribute to customize Discord login icons. All attributes are optional except view.<br/><br/>
						<b>Square Shape Example:</b> <code id='2'>[miniorange_discord_login shape="square" theme="default" space="4" size="35"]</code><i style= "width: 11px;height: 9px;padding-left:2px;padding-top:3px" class="far fa-fw fa-lg fa-copy mo_discord_copy mo_discord_copytooltip" onclick="copyToClipboard(this, '#2', '#shortcode_url1_copy')"><span id="shortcode_url1_copy" class="mo_discord_copytooltiptext">Copy to Clipboard</span></i><br/><br/>
						<a class=" login-button" rel="nofollow" title=" Login with Discord"><i class="fab fa-discord login-button square" style="width:35px !important;height: 30px !important;margin-left: 4px !important;font-size: 1.8em;text-align: center;background: #7289da;color: #FFFFFF;padding-top: 8px;"></i></a><br/><br/>

						<b>Round Shape Example:</b> <code id='3'>[miniorange_discord_login shape="round" theme="default" space="4" size="35"]</code><i style= "width: 11px;height: 9px;padding-left:2px;padding-top:3px" class="far fa-fw fa-lg fa-copy mo_discord_copy mo_discord_copytooltip" onclick="copyToClipboard(this, '#3', '#shortcode_url2_copy')"><span id="shortcode_url2_copy" class="mo_discord_copytooltiptext">Copy to Clipboard</span></i><br/><br/>
						<a class=" login-button" rel="nofollow" title=" Login with Discord"><i class="fab fa-discord login-button round" style="width:35px !important;height: 28px !important;margin-left: 4px !important;font-size: 1.8em;text-align: center;background: #7289da;color: #FFFFFF;padding-top: 6px;"></i></a><br/><br/>
						<hr>
						<h3>For Long-Buttons</h3>
						You can use different attribute to customize Discord login buttons. All attributes are optional.<br/><br/>
						<b>Example:<br/></b><code id='4'>[miniorange_discord_login shape="longbuttonwithtext" theme="default" space="8" width="180" height="35" color="000000"]</code><i style= "width: 11px;height: 9px;padding-left:2px;padding-top:3px" class="far fa-fw fa-lg fa-copy mo_discord_copy mo_discord_copytooltip" onclick="copyToClipboard(this, '#4', '#shortcode_url3_copy')"><span id="shortcode_url3_copy" class="mo_discord_copytooltiptext">Copy to Clipboard</span></i><br/><br/>
						<a rel="nofollow" style="margin-left: 8px !important;width: 180px !important;padding-top:6px !important;padding-bottom:6px !important;margin-bottom: 3px !important;border-radius: 4px !important;" class="mo_btn mo_btn-mo mo_btn-block mo_btn-social mo_btn-discord mo_btn-custom-dec login-button"> <i style="padding-top:0px !important" class="fab fa-discord"></i>Login with Discord</a></br><hr>

						<body>

						<table style="margin-left: 8%" id="mo_discord_shortcode_table">
							<tr>
								<th colspan="2" style="align-content: center">Available values for attributes</th>
							</tr>

							<tr>
								<td><b>view</b></td>
								<td>horizontal, vertical</td>

							</tr>
							<tr>
								<td><b>shape</b></td>
								<td>round, roundededges, square, longbuttonwithtext</td>

							</tr>
							<tr>
								<td><b>theme</b></td>
								<td>default, custombackground</td>

							</tr>
							<tr>
								<td><b>size</b></td>
								<td>Any value between 20 to 100</td>

							</tr>
							<tr>
								<td><b>space</b></td>
								<td>Any value between 0 to 100</td>

							</tr>
							<tr>
								<td><b>width</b></td>
								<td>Any value between 200 to 1000</td>

							</tr>
							<tr>
								<td><b>height</b></td>
								<td>Any value between 35 to 50</td>

							</tr>
							<tr>
								<td><b>color</b></td>
								<td>Enter color code for example, FFFFFF</td>

							</tr>
							<tr>
								<td><b>heading</b></td>
								<td>Enter custom heading</td>

							</tr>
						</table>

						</body>
					</div>
					<br/><hr><br/>
					<h3>Shortcode in php file</h3>
					You can use shortcode in PHP file as following:
					<code>&lt;&#63;php echo apply_shortcodes('SHORTCODE') /&#63;&gt;</code><br/><br/>
					'Replace SHORTCODE in above code with the required shortcode like <code>[miniorange_discord_login theme="default"]</code>, so the final code looks like following :<br/><br/>
					<code id='7'>&lt;&#63;php echo apply_shortcodes('[miniorange_discord_login theme="default"]') &#63;&gt;</code><i style= "width: 11px;height: 9px;padding-left:2px;padding-top:3px" class="far fa-fw fa-lg fa-copy mo_discord_copy mo_discord_copytooltip" onclick="copyToClipboard(this, '#7', '#shortcode_url33_copy')"><span id="shortcode_url33_copy" class="mo_discord_copytooltiptext">Copy to Clipboard</span></i><br/><br/>
				</td>
			</tr>
		</table>
	</div>
<script>
	jQuery('#mo_discord_page_heading').text('Shortcode');
</script>
	<?php
}
