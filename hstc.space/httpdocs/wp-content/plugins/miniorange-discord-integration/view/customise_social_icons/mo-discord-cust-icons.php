<?php
/**
 * Customize icon for discord.
 *
 * @package MO_DISCORD_INTEGRATOR
 */

/**
 * Customize Icon control.
 *
 * @return void
 */
function mo_discord_customise_social_icons() {
	?><br/>
	<form id="form-apps" name="form-apps" method="post" action="">
		<input type="hidden" name="option" value="mo_discord_customise_social_icons" />
		<input type="hidden" name="mo_discord_customise_social_icons_nonce" value="<?php echo esc_attr( wp_create_nonce( 'mo-discord-customise-social-icons-nonce' ) ); ?>"/>

		<div style="min-height: 608px" class="mo_discord_table_layout">
			<div style="float: left;width: 55%;">
				<div style="width: 100%;">
					<div style="float:left;width:50%;">
						<label style="font-size: 1.2em;"><b>Shape</b><br></label>
						<label class="mo-discord-radio-container">Round
							<input type="radio" id="mo_discord_login_shape_round"  name="mo_discord_login_theme" value="circle" onclick="shape_change();checkLoginButton();moLoginPreview(document.getElementById('mo_login_icon_size').value ,'circle',setLoginCustomTheme(),document.getElementById('mo_login_icon_custom_color').value,document.getElementById('mo_login_icon_space').value,document.getElementById('mo_login_icon_custom_boundary').value)" <?php checked( get_option( 'mo_discord_login_theme' ) === 'circle' ); ?> /><br>
							<span class="mo-discord-radio-checkmark"></span></label>
						<label class="mo-discord-radio-container">Rounded Edges
							<input type="radio" id="mo_discord_login_shape_rounded_edges" name="mo_discord_login_theme" value="oval" onclick="shape_change();checkLoginButton();moLoginPreview(document.getElementById('mo_login_icon_size').value ,'oval',setLoginCustomTheme(),document.getElementById('mo_login_icon_custom_color').value,document.getElementById('mo_login_icon_space').value,document.getElementById('mo_login_icon_custom_boundary').value)"  <?php checked( get_option( 'mo_discord_login_theme' ) === 'oval' ); ?> /><br>
							<span class="mo-discord-radio-checkmark"></span></label>

						<label class="mo-discord-radio-container">Square
							<input type="radio" id="mo_discord_login_shape_square" name="mo_discord_login_theme" value="square" onclick="shape_change();checkLoginButton();moLoginPreview(document.getElementById('mo_login_icon_size').value ,'square',setLoginCustomTheme(),document.getElementById('mo_login_icon_custom_color').value,document.getElementById('mo_login_icon_space').value,document.getElementById('mo_login_icon_custom_boundary').value)" <?php checked( get_option( 'mo_discord_login_theme' ) === 'square' ); ?> /><br>
							<span class="mo-discord-radio-checkmark"></span></label>
						<label class="mo-discord-radio-container">Long Button
							<input type="radio" id="mo_discord_login_shape_longbutton" name="mo_discord_login_theme" value="longbutton" onclick="shape_change();checkLoginButton();moLoginPreview(document.getElementById('mo_login_icon_width').value ,'longbutton',setLoginCustomTheme(),document.getElementById('mo_login_icon_custom_color').value,document.getElementById('mo_login_icon_space').value,document.getElementById('mo_login_icon_height').value,document.getElementById('mo_login_icon_custom_boundary').value)" <?php checked( get_option( 'mo_discord_login_theme' ) === 'longbutton' ); ?> /><br>
							<span class="mo-discord-radio-checkmark"></span></label>
					</div>
					<div style="float: right; width: 50%;">
						<label style="font-size: 1.2em;"><b>Theme</b><br></label>
						<label class="mo-discord-radio-container">Default
							<input type="radio" id="mo_discord_default_background_radio" name="mo_discord_login_custom_theme"
								value="default" onclick="checkLoginButton();moLoginPreview(setSizeOfIcons(), setLoginTheme(),'default',document.getElementById('mo_login_icon_custom_color').value,document.getElementById('mo_login_icon_space').value,document.getElementById('mo_login_icon_height').value,document.getElementById('mo_login_icon_custom_boundary').value)"
								<?php checked( get_option( 'mo_discord_login_custom_theme' ) === 'default' ); ?> /><br>
							<span class="mo-discord-radio-checkmark"></span></label>

						<label class="mo-discord-radio-container">Custom background<a style="left: 1%; position: relative; text-decoration: none" class="mo-discord-premium" href="<?php echo esc_url( add_query_arg( array( 'tab' => 'licensing_plans' ), isset( $_SERVER['REQUEST_URI'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) ) : '' ) ); ?>">PRO</a>
							<input type="radio" id="mo_discord_custom_background_radio"  name="mo_discord_login_custom_theme" value="custom" onclick="checkLoginButton();moLoginPreview(setSizeOfIcons(), setLoginTheme(),'custom',document.getElementById('mo_login_icon_custom_color').value,document.getElementById('mo_login_icon_space').value,document.getElementById('mo_login_icon_height').value,document.getElementById('mo_login_icon_custom_boundary').value)"
								<?php checked( get_option( 'mo_discord_login_custom_theme' ) === 'custom' ); ?> /><br>
							<span class="mo-discord-radio-checkmark"></span></label>

						<input id="mo_login_icon_custom_color" style="width:135px; margin-bottom: 3px" name="mo_login_icon_custom_color"  type="color" value="<?php echo esc_attr( get_option( 'mo_login_icon_custom_color' ) ); ?>" onchange="moLoginPreview(setSizeOfIcons(), setLoginTheme(),'custom',document.getElementById('mo_login_icon_custom_color').value,document.getElementById('mo_login_icon_space').value,document.getElementById('mo_login_icon_custom_boundary').value)" >

						<label class="mo-discord-radio-container">White<a style="left: 1%; position: relative; text-decoration: none" class="mo-discord-premium" href="<?php echo esc_url( add_query_arg( array( 'tab' => 'licensing_plans' ), isset( $_SERVER['REQUEST_URI'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) ) : '' ) ); ?>">PRO</a>
							<input type="radio" id="mo_discord_white_background_radio" name="mo_discord_login_custom_theme"
								value="white" onclick="checkLoginButton();moLoginPreview(setSizeOfIcons(), setLoginTheme(),'white',document.getElementById('mo_login_icon_custom_color').value,document.getElementById('mo_login_icon_space').value,document.getElementById('mo_login_icon_height').value,document.getElementById('mo_login_icon_custom_boundary').value)"
								<?php checked( get_option( 'mo_discord_login_custom_theme' ) === 'white' ); ?> /><br>
							<span class="mo-discord-radio-checkmark"></span></label>

					</div>
				</div>
				<div style="width: 85%; float: left" class="mo_discord_note_style"><strong>Custom background:</strong> This will change the background color of login icons.</div>

				<div style="width: 100%; float: left">
					<div style="float:left;width:50%; margin-top: 5%">
						<label style="font-size: 1.2em;"><b>Size of Icons</b></label>
						<div id="long_button_size">
							Width: &nbsp;<input class="mo_discord_textfield_css" style="border: 1px solid ;border-color: #0867b2;width: 16%;margin-bottom: 3px" id="mo_login_icon_width" name="mo_login_icon_custom_width" type="text" value="<?php echo esc_attr( get_option( 'mo_login_icon_custom_width' ) ); ?>" >
							<input id="mo_login_width_plus" type="button" value="+" onmouseup="moLoginPreview(document.getElementById('mo_login_icon_width').value ,setLoginTheme(),setLoginCustomTheme(),document.getElementById('mo_login_icon_custom_color').value,document.getElementById('mo_login_icon_space').value,document.getElementById('mo_login_icon_height').value,document.getElementById('mo_login_icon_custom_boundary').value)" >
							<input id="mo_login_width_minus" type="button" value="-" onmouseup="moLoginPreview(document.getElementById('mo_login_icon_width').value ,setLoginTheme(),setLoginCustomTheme(),document.getElementById('mo_login_icon_custom_color').value,document.getElementById('mo_login_icon_space').value,document.getElementById('mo_login_icon_height').value,document.getElementById('mo_login_icon_custom_boundary').value)" ><br/>
							Height:&nbsp;<input class="mo_discord_textfield_css" style="border: 1px solid ;border-color: #0867b2;width: 16%;margin-bottom: 3px" id="mo_login_icon_height" name="mo_login_icon_custom_height" type="text" value="<?php echo esc_attr( get_option( 'mo_login_icon_custom_height' ) ); ?>" >
							<input id="mo_login_height_plus" type="button" value="+" onmouseup="moLoginPreview(document.getElementById('mo_login_icon_width').value,setLoginTheme(),setLoginCustomTheme(),document.getElementById('mo_login_icon_custom_color').value,document.getElementById('mo_login_icon_space').value,document.getElementById('mo_login_icon_height').value,document.getElementById('mo_login_icon_custom_boundary').value)" >
							<input id="mo_login_height_minus" type="button" value="-" onmouseup="moLoginPreview(document.getElementById('mo_login_icon_width').value,setLoginTheme(),setLoginCustomTheme(),document.getElementById('mo_login_icon_custom_color').value,document.getElementById('mo_login_icon_space').value,document.getElementById('mo_login_icon_height').value,document.getElementById('mo_login_icon_custom_boundary').value)" ><br/>
							Curve:&nbsp;<input class="mo_discord_textfield_css" style="border: 1px solid ;border-color: #0867b2;width: 16%;margin-bottom: 3px" id="mo_login_icon_custom_boundary" name="mo_login_icon_custom_boundary" type="text" value="<?php echo esc_attr( get_option( 'mo_login_icon_custom_boundary' ) ); ?>" />
							<input id="mo_login_boundary_plus" type="button" value="+" onmouseup="moLoginPreview(document.getElementById('mo_login_icon_width').value,setLoginTheme(),setLoginCustomTheme(),document.getElementById('mo_login_icon_custom_color').value,document.getElementById('mo_login_icon_space').value,document.getElementById('mo_login_icon_height').value,document.getElementById('mo_login_icon_custom_boundary').value)" />
							<input id="mo_login_boundary_minus" type="button" value="-" onmouseup="moLoginPreview(document.getElementById('mo_login_icon_width').value,setLoginTheme(),setLoginCustomTheme(),document.getElementById('mo_login_icon_custom_color').value,document.getElementById('mo_login_icon_space').value,document.getElementById('mo_login_icon_height').value,document.getElementById('mo_login_icon_custom_boundary').value)" />
						</div>
						<div id="other_button_size">
							<input style="width:50px" id="mo_login_icon_size" onkeyup="moLoginSizeValidate(this)" name="mo_login_icon_custom_size" type="text" value="<?php echo esc_attr( get_option( 'mo_login_icon_custom_size' ) ); ?>">
							<input id="mo_login_size_plus" type="button" value="+" onmouseup="moLoginPreview(document.getElementById('mo_login_icon_size').value ,setLoginTheme(),setLoginCustomTheme(),document.getElementById('mo_login_icon_custom_color').value,document.getElementById('mo_login_icon_space').value,document.getElementById('mo_login_icon_custom_boundary').value)" />
							<input id="mo_login_size_minus" type="button" value="-" onmouseup="moLoginPreview(document.getElementById('mo_login_icon_size').value ,setLoginTheme(),setLoginCustomTheme(),document.getElementById('mo_login_icon_custom_color').value,document.getElementById('mo_login_icon_space').value,document.getElementById('mo_login_icon_custom_boundary').value)" />
						</div>
					</div>
					<div style="width: 50%;float: right;margin-top: 5%">
						<label style="font-size: 1.2em;"><b>Space between Icons</b></label><br/>
						<input class="mo_discord_textfield_css" style="border: 1px solid ;border-color: #0867b2;width: 16%;margin-bottom: 3px" onkeyup="moLoginSpaceValidate(this)" id="mo_login_icon_space" name="mo_login_icon_space" type="text" value="<?php echo esc_attr( get_option( 'mo_login_icon_space' ) ); ?>"/>
						<input id="mo_login_space_plus" type="button" value="+" onmouseup="moLoginPreview(setSizeOfIcons() ,setLoginTheme(),setLoginCustomTheme(),document.getElementById('mo_login_icon_custom_color').value,document.getElementById('mo_login_icon_space').value,document.getElementById('mo_login_icon_custom_boundary').value)" />
						<input id="mo_login_space_minus" type="button" value="-" onmouseup="moLoginPreview(setSizeOfIcons()  ,setLoginTheme(),setLoginCustomTheme(),document.getElementById('mo_login_icon_custom_color').value,document.getElementById('mo_login_icon_space').value,document.getElementById('mo_login_icon_custom_boundary').value)" />
					</div>


				</div>

				<div style="width: 100%; float: left">
					<br><hr>
					<div style="width: 100%">
						<label class="mo_discord_checkbox_container">Load Fontawesome files
							<input  type="checkbox" id="mo_fonawesome_load" name="mo_discord_fonawesome_load" value="1" <?php checked( get_option( 'mo_discord_fonawesome_load' ) === '1' ); ?> /><br>
							<span class="mo_discord_checkbox_checkmark"></span>
						</label>

						<label class="mo_discord_checkbox_container">Load bootstrap files
							<input  type="checkbox" id="mo_bootstrap_load" name="mo_discord_bootstrap_load" value="1" <?php checked( get_option( 'mo_discord_bootstrap_load' ) === '1' ); ?> /><br>
							<span class="mo_discord_checkbox_checkmark"></span>
						</label>
						<h4 style="font-size: 1.2em">Customize Text For Social Login Buttons / Icons</h4>

						<div style="width: 40%; float: left">
							<label class="mo_discord_fix_fontsize">Select color for customize text:</label>
						</div>
						<div style="width: 60%; float: right;">
							<input id="mo_discord_table_textbox" name="mo_login_discord_login_widget_customize_textcolor"  type="color" value="<?php echo esc_attr( get_option( 'mo_login_discord_login_widget_customize_textcolor' ) ); ?>" >
						</div>
					</div>
					<div style="width: 100%; margin-top: 12%">
						<div style="width: 100%;">
							<label class="mo_discord_fix_fontsize">Enter text to show above login widget:</label>
							<input class="mo_discord_textfield_css" style="border: 1px solid ;border-color: #0867b2" type="text" name="mo_discord_login_widget_customize_text" value="<?php echo esc_attr( get_option( 'mo_discord_login_widget_customize_text' ) ); ?>" />
						</div>
					</div>
					<div style="width: 100%; margin-top: 2%" id="long_button_text">
						<div style="width: 100%; float: left">
							<label class="mo_discord_fix_fontsize">Enter text to show on your login buttons:</label>
							<input class="mo_discord_textfield_css" style="border: 1px solid ;border-color: #0867b2" type="text" name="mo_discord_login_button_customize_text" value="<?php echo esc_attr( get_option( 'mo_discord_login_button_customize_text' ) ); ?>"  />
						</div>
					</div>
				</div>
				<div style="width: 100%; float: left">
					<br><hr>
					<h4 style="font-size: 1.2em">Customize Text to show user after Login</h4>
					<div style="width: 100%;">
						<div style="width: 100%; float: left">
							<label class="mo_discord_fix_fontsize">Enter text to show before the logout link. Use ##username## to display current username:</label> <br>
							<input class="mo_discord_textfield_css" style="border: 1px solid ;border-color: #0867b2" type="text" name="mo_discord_login_widget_customize_logout_name_text"  value="<?php echo esc_attr( get_option( 'mo_discord_login_widget_customize_logout_name_text' ) ); ?>" />
						</div>
					</div>
					<div style="width: 100%; margin-top: 15%" id="long_button_text">
						<br>
						<div style="width: 100%; float: left">
							<label class="mo_discord_fix_fontsize">Enter text to show as logout link:</label>
							<input class="mo_discord_textfield_css" style="border: 1px solid ;border-color: #0867b2" type="text" name="mo_discord_login_widget_customize_logout_text" value="<?php echo esc_attr( get_option( 'mo_discord_login_widget_customize_logout_text' ) ); ?>"  />
						</div>
					</div>
				</div>
				<div style="width: 100%; float: left">
					<br>
					<hr>
				<div style="width:80%; background:white; float:left; border: 1px transparent;padding-top: 3%">
						<b style="font-size: 17px">Select the options where you want to display the social login icons</b><br><br>
						<label class="mo_discord_checkbox_container">Default Login Form [wp-admin]
							<input  type="checkbox" id="default_login_enable" name="mo_discord_default_login_enable" value="1" <?php checked( get_option( 'mo_discord_default_login_enable' ) === '1' ); ?> /><br>
							<span class="mo_discord_checkbox_checkmark"></span>
						</label>

						<label class="mo_discord_checkbox_container">Default Registration Form

							<input type="checkbox" id="default_register_enable" name="mo_discord_default_register_enable" value="1" <?php checked( get_option( 'mo_discord_default_register_enable' ) === '1' ); ?> /><br>
							<span class="mo_discord_checkbox_checkmark"></span>
						</label>

						<label class="mo_discord_note_style" style="cursor: auto">Don't find your login page in above options use <code id='1'>[miniorange_discord_login]</code><i style= "width: 11px;height: 9px;padding-left:2px;padding-top:3px" class="far fa-fw fa-lg fa-copy mo_discord_copy mo_discord_copytooltip" onclick="copyToClipboard(this, '#1', '#shortcode_url_copy')"><span id="shortcode_url_copy" class="mo_discord_copytooltiptext">Copy to Clipboard</span></i> to display Discord login icon or <a style="cursor: pointer" onclick="mo_discord_support_form('')">Contact Us</a></label>
						<br/><br/>

					</div>
				</div>
				<div style="margin-top: 8%; margin-bottom: 2%">
					<b><input type="submit" name="submit" value="Save" style="width:150px;background-color:#0867b2;color:white;box-shadow:none;text-shadow: none;"  class="button button-primary button-large" /></b>
				</div>
			</div>
			<div style="float:left; width: 42%">
			<center>
			<div style="border: 1px solid black; min-width: 200px; min-height: 100px; padding-top: 8%; padding-bottom: 5%">
				<b>Preview : </b><br/>
				<b class="mo_discord_theme_notice">This Theme available in the PAID PLAN of the plugin.</b>
				<div style="padding-bottom: 1%; padding-top: 3%">
					<?php
					$default_color = array( 'discord' => '#7289da' );
					$app_pos       = get_option( 'app_pos' );
					$app_pos       = explode( '#', $app_pos );
					$count_app     = 0;
					foreach ( $app_pos as $active_app ) {
						if ( get_option( 'mo_' . $active_app . '_enable' ) ) {
							$class_app = $active_app;
							$icon      = $active_app;

							$count_app++;
							?>
							<i class="mo_login_icon_preview  fab fa-<?php echo esc_attr( $icon ); ?>" id="mo_login_icon_preview_discord" style="background:<?php echo esc_attr( $default_color[ $active_app ] ); ?>;text-align:center;margin-top:5px;color: #FFFFFF" ></i>
							<a id="mo_login_button_preview_<?php echo esc_attr( $active_app ); ?>" class="mo_btn mo_btn-block mo_btn-defaulttheme mo_btn-social mo_btn-<?php echo esc_attr( $class_app ); ?> mo_btn-custom-size"> <i class="fab fa-<?php echo esc_attr( $icon ); ?>"></i>
								<?php
								echo esc_html( get_option( 'mo_discord_login_button_customize_text' ) );
								?>
								<?php echo esc_attr( $active_app ); ?></a>
							<i class="mo_custom_login_icon_preview fab fa-<?php echo esc_attr( $icon ); ?>" id="mo_custom_login_icon_preview_<?php echo esc_attr( $active_app ); ?>"  style="color:#ffffff;text-align:center;margin-top:5px;"></i>
							<a id="mo_custom_login_button_preview_<?php echo esc_attr( $active_app ); ?>" class="mo_btn mo_btn-block mo_btn-customtheme mo_btn-social   mo_btn-custom-size"> <i class="fab fa-<?php echo esc_attr( $icon ); ?>"></i>
								<?php
								echo esc_html( get_option( 'mo_discord_login_button_customize_text' ) );
								?>
								<?php echo esc_attr( $active_app ); ?></a>

							<i class="mo_white_login_icon_preview fab fa-<?php echo esc_attr( $icon ); ?> " id="mo_white_login_icon_preview_<?php echo esc_attr( $active_app ); ?>"  style="color:<?php echo esc_attr( $default_color[ $active_app ] ); ?>;text-align:center;margin-top:5px;"></i>
							<a id="mo_white_login_button_preview_<?php echo esc_attr( $active_app ); ?>" class="mo_btn mo_btn-block mo_discord_mo_btn-whitetheme   mo_btn-social mo_btn-custom-size "> <i style="color:<?php echo esc_attr( $default_color[ $active_app ] ); ?>;" class="fab fa-<?php echo esc_attr( $icon ); ?> mofab"></i>
								<?php
								echo esc_html( get_option( 'mo_discord_login_button_customize_text' ) );
								?>
								<?php echo esc_attr( $active_app ); ?></a>

							<?php

						}
					}
					if ( 0 === $count_app ) {
						?>
						<p>No activated apps found.</p>
						<?php
					}
					?>
				</div>
			</div><br/>
				<div style="border: 1px solid"><br>
					<b style="font-size: 17px;">Custom CSS<a style="left: 1%; position: relative; text-decoration: none" class="mo-discord-premium" href="<?php echo esc_url( add_query_arg( array( 'tab' => 'licensing_plans' ), isset( $_SERVER['REQUEST_URI'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) ) : '' ) ); ?>">PRO</a></b>
						<textarea disabled type="text" id="mo_discord_custom_css" style="resize: vertical; width:400px; height:180px;  margin:5% auto;" rows="6" name="mo_discord_custom_css"></textarea><br/><b>Example CSS:</b>
						<p>NOTE: Please keep the class name same as example CSS.</p>
						<pre>
	.mo_login_button {
	width:100%;
	height:50px;
	padding-top:15px;
	padding-bottom:15px;
	margin-bottom:-1px;
	border-radius:4px;
	background: #7272dc;
	text-align:center;
	font-size:16px;
	color:#fff;
	margin-bottom:5px;
}
							</pre>
			</center>
			</div>
		</div>
	</form>
	<script>

		//to set heading name
		jQuery('#mo_discord_page_heading').text('Customize Login Icons');
		window.onload=shape_change();
		function shape_change() {
			var y = document.getElementById('mo_discord_login_shape_longbutton').checked;
			if(y!=true) {
				jQuery('#long_button_size').hide();
				jQuery('#long_button_text').hide();
				jQuery('#other_button_size').show();
			}
			else {
				jQuery('#long_button_size').show();
				jQuery('#long_button_text').show();
				jQuery('#other_button_size').hide();
			}
		}

		var tempHorSize = '<?php echo esc_attr( get_option( 'mo_login_icon_custom_size' ) ); ?>';
		var tempHorTheme = '<?php echo esc_attr( get_option( 'mo_discord_login_theme' ) ); ?>';
		var tempHorCustomTheme = '<?php echo esc_attr( get_option( 'mo_discord_login_custom_theme' ) ); ?>';
		var tempHorCustomColor = '<?php echo esc_attr( get_option( 'mo_login_icon_custom_color' ) ); ?>';
		var tempHorSpace = '<?php echo esc_attr( get_option( 'mo_login_icon_space' ) ); ?>';
		var tempHorHeight = '<?php echo esc_attr( get_option( 'mo_login_icon_custom_height' ) ); ?>';
		var tempHorBoundary='<?php echo esc_attr( get_option( 'mo_login_icon_custom_boundary' ) ); ?>';

		function moLoginSpaceValidate(e){
			var t=parseInt(e.value.trim());t>60?e.value=60:0>t&&(e.value=0)
		}

		function moLoginIncrement(e,t,r,a,i){
			var h,s,c=!1,_=a;s=function(){
				"add"==t&&r.value<60?r.value++:"subtract"==t&&r.value>20&&r.value--,h=setTimeout(s,_),_>20&&(_*=i),c||(document.onmouseup=function(){clearTimeout(h),document.onmouseup=null,c=!1,_=a},c=!0)},e.onmousedown=s}

		function moLoginSpaceIncrement(e,t,r,a,i){
			var h,s,c=!1,_=a;s=function(){
				"add"==t&&r.value<60?r.value++:"subtract"==t&&r.value>0&&r.value--,h=setTimeout(s,_),_>20&&(_*=i),c||(document.onmouseup=function(){clearTimeout(h),document.onmouseup=null,c=!1,_=a},c=!0)},e.onmousedown=s}

		function moLoginWidthIncrement(e,t,r,a,i){
			var h,s,c=!1,_=a;s=function(){
				"add"==t&&r.value<1000?r.value++:"subtract"==t&&r.value>140&&r.value--,h=setTimeout(s,_),_>20&&(_*=i),c||(document.onmouseup=function(){clearTimeout(h),document.onmouseup=null,c=!1,_=a},c=!0)},e.onmousedown=s}

		function moLoginHeightIncrement(e,t,r,a,i){
			var h,s,c=!1,_=a;s=function(){
				"add"==t&&r.value<50?r.value++:"subtract"==t&&r.value>35&&r.value--,h=setTimeout(s,_),_>20&&(_*=i),c||(document.onmouseup=function(){clearTimeout(h),document.onmouseup=null,c=!1,_=a},c=!0)},e.onmousedown=s}

		function moLoginBoundaryIncrement(e,t,r,a,i){
			var h,s,c=!1,_=a;s=function(){
				"add"==t&&r.value<25?r.value++:"subtract"==t&&r.value>0&&r.value--,h=setTimeout(s,_),_>20&&(_*=i),c||(document.onmouseup=function(){clearTimeout(h),document.onmouseup=null,c=!1,_=a},c=!0)},e.onmousedown=s}

		moLoginIncrement(document.getElementById('mo_login_size_plus'), "add", document.getElementById('mo_login_icon_size'), 300, 0.7);
		moLoginIncrement(document.getElementById('mo_login_size_minus'), "subtract", document.getElementById('mo_login_icon_size'), 300, 0.7);

		moLoginIncrement(document.getElementById('mo_login_size_plus'), "add", document.getElementById('mo_login_icon_size'), 300, 0.7);
		moLoginIncrement(document.getElementById('mo_login_size_minus'), "subtract", document.getElementById('mo_login_icon_size'), 300, 0.7);

		moLoginSpaceIncrement(document.getElementById('mo_login_space_plus'), "add", document.getElementById('mo_login_icon_space'), 300, 0.7);
		moLoginSpaceIncrement(document.getElementById('mo_login_space_minus'), "subtract", document.getElementById('mo_login_icon_space'), 300, 0.7);

		moLoginWidthIncrement(document.getElementById('mo_login_width_plus'), "add", document.getElementById('mo_login_icon_width'), 300, 0.7);
		moLoginWidthIncrement(document.getElementById('mo_login_width_minus'), "subtract", document.getElementById('mo_login_icon_width'), 300, 0.7);

		moLoginHeightIncrement(document.getElementById('mo_login_height_plus'), "add", document.getElementById('mo_login_icon_height'), 300, 0.7);
		moLoginHeightIncrement(document.getElementById('mo_login_height_minus'), "subtract", document.getElementById('mo_login_icon_height'), 300, 0.7);

		moLoginBoundaryIncrement(document.getElementById('mo_login_boundary_plus'), "add", document.getElementById('mo_login_icon_custom_boundary'), 300, 0.7);
		moLoginBoundaryIncrement(document.getElementById('mo_login_boundary_minus'), "subtract", document.getElementById('mo_login_icon_custom_boundary'), 300, 0.7);

		function setLoginTheme(){return jQuery('input[name=mo_discord_login_theme]:checked', '#form-apps').val();}
		function setLoginCustomTheme(){return jQuery('input[name=mo_discord_login_custom_theme]:checked', '#form-apps').val();}
		function setSizeOfIcons(){
			if((jQuery('input[name=mo_discord_login_theme]:checked', '#form-apps').val()) == 'longbutton'){
				return document.getElementById('mo_login_icon_width').value;
			}else{
				return document.getElementById('mo_login_icon_size').value;
			}
		}
		moLoginPreview(setSizeOfIcons(),tempHorTheme,tempHorCustomTheme,tempHorCustomColor,tempHorSpace,tempHorHeight,tempHorBoundary);

		function moLoginPreview(t,r,l,p,n,h,k){
			if(l == 'default'){
				if(r == 'longbutton'){
					jQuery(".mo_discord_theme_notice").css("display", "none   ");
					var a = "mo_btn-defaulttheme";
					jQuery("."+a).css("width",t+"px");
					jQuery("."+a).each(function () {
						jQuery(this).css("margin-top", "5px");
						jQuery(this).css("padding-top",(h-29)+"px");
						jQuery(this).css("padding-bottom",(h-29)+"px");
						jQuery(this).css("margin-bottom",(n-5)+"px");
						jQuery(this).css("border-radius",k+"px");
					});
					jQuery(".fa").css("padding-top",(h-35)+"px");

				}else{
					var a="mo_login_icon_preview";
					jQuery("."+a).css("margin-left",(n-4)+"px");
					jQuery("."+a).css("cursor","pointer");
					jQuery("."+a).css({height:t-8,width:t});
					jQuery("."+a).css("padding-top","8px");
					if(r=="circle"){
						jQuery("."+a).css("borderRadius","999px");
					}else if(r=="oval"){
						jQuery("."+a).css("borderRadius","5px");
					}else if(r=="square"){
						jQuery("."+a).css("borderRadius","0px");
					}
					jQuery("."+a).css("font-size",(t-16)+"px");

				}
			}
			else if(l == 'custom'){
				jQuery(".mo_discord_theme_notice").css("display", "block");
				if(r == 'longbutton'){
					var a = "mo_btn-customtheme";
					jQuery("."+a).css("margin-top", "5px");
					jQuery("."+a).css("width",(t)+"px");
					jQuery("."+a).css("padding-top",(h-29)+"px");
					jQuery("."+a).css("padding-bottom",(h-29)+"px");
					jQuery(".fa").css("padding-top",(h-35)+"px");
					jQuery("."+a).css("margin-bottom",(n-5)+"px");
					jQuery("."+a).css("background",p);
					jQuery("."+a).css("border-radius",k+"px");
				}else{
					var a="mo_custom_login_icon_preview";
					jQuery("."+a).css({height:t-8,width:t});
					jQuery("."+a).css("padding-top","8px");
					jQuery("."+a).css("margin-left",(n-4)+"px");

					if(r=="circle"){
						jQuery("."+a).css("borderRadius","999px");
					}else if(r=="oval"){
						jQuery("."+a).css("borderRadius","5px");
					}else if(r=="square"){
						jQuery("."+a).css("borderRadius","0px");
					}
					jQuery("."+a).css("background",p);
					jQuery("."+a).css("font-size",(t-16)+"px");
					jQuery("#disq").css({height:t-21});
					jQuery("#kaka").css({height:t-21});
				}
			}
			else if(l == 'white'){
				p = 'ffffff';
				jQuery(".mo_discord_theme_notice").css("display", "block");
				if(r == 'longbutton'){
					var a = "mo_discord_mo_btn-whitetheme";
					jQuery("."+a).css("margin-top", "5px");
					jQuery("."+a).css("width",(t)+"px");
					jQuery("."+a).css("padding-top",(h-29)+"px");
					jQuery("."+a).css("padding-bottom",(h-29)+"px");
					jQuery("."+a).css("border-color", "#000000");
					jQuery("."+a).css("color", "#000000");
					jQuery(".fa").css("padding-top",(h-35)+"px");
					jQuery("."+a).css("margin-bottom",(n-5)+"px");
					jQuery("."+a).css("background","#"+p);
					jQuery("."+a).css("border-radius",k+"px");
				}else{
					var a = "mo_white_login_icon_preview";
					jQuery("."+a).css("cursor","pointer");
					jQuery("."+a).css({"height":t-8,width:t});
					jQuery("."+a).css("padding-top","8px");
					jQuery("."+a).css("font-size",(t-14)+"px");
					jQuery("."+a).css("border-color","black");
					jQuery("."+a).css("border-style","solid");
					jQuery("."+a).css("border-width","1px");
					jQuery("."+a).css("margin-left",(n-4)+"px");

					if(r=="circle"){
						jQuery("."+a).css("borderRadius","999px");
					}else if(r=="oval"){
						jQuery("."+a).css("borderRadius","5px");
					}else if(r=="square"){
						jQuery("."+a).css("borderRadius","0px");
					}

				}
			}
			previewLoginIcons();
		}

		function checkLoginButton(){
			if(jQuery('input[name=mo_discord_login_theme]:checked', '#form-apps').val() == 'longbutton') {
				if(setLoginCustomTheme() == 'default'){
					jQuery(".mo_login_icon_preview").hide();
					jQuery(".mo_custom_login_icon_preview").hide();
					jQuery(".mo_btn-customtheme").hide();
					jQuery(".mo_white_login_icon_preview").hide();
					jQuery(".mo_discord_mo_btn-whitetheme").hide();
					jQuery(".mo_btn-defaulttheme").show();
				}else if(setLoginCustomTheme() == 'custom'){
					jQuery(".mo_login_icon_preview").hide();
					jQuery(".mo_custom_login_icon_preview").hide();
					jQuery(".mo_btn-defaulttheme").hide();
					jQuery(".mo_white_login_icon_preview").hide();
					jQuery(".mo_discord_mo_btn-whitetheme").hide();
					jQuery(".mo_btn-customtheme").show();
				}else if(setLoginCustomTheme() == 'white'){
					jQuery(".mo_login_icon_preview").hide();
					jQuery(".mo_custom_login_icon_preview").hide();
					jQuery(".mo_btn-defaulttheme").hide();
					jQuery(".mo_white_login_icon_preview").hide();
					jQuery(".mo_btn-customtheme").hide();
					jQuery(".mo_discord_mo_btn-whitetheme").show();

				}
			}
			else {
				if(setLoginCustomTheme() == 'default'){
					jQuery(".mo_login_icon_preview").show();
					jQuery(".mo_btn-defaulttheme").hide();
					jQuery(".mo_btn-customtheme").hide();
					jQuery(".mo_custom_login_icon_preview").hide();
					jQuery(".mo_white_login_icon_preview").hide();
					jQuery(".mo_discord_mo_btn-whitetheme").hide();

				}else if(setLoginCustomTheme() == 'custom'){
					jQuery(".mo_login_icon_preview").hide();
					jQuery(".mo_custom_login_icon_preview").show();
					jQuery(".mo_btn-defaulttheme").hide();
					jQuery(".mo_btn-customtheme").hide();
					jQuery(".mo_discord_mo_btn-whitetheme").hide();
					jQuery(".mo_white_login_icon_preview").hide();

				}
				else if(setLoginCustomTheme() == 'white'){
					jQuery(".mo_login_icon_preview").hide();
					jQuery(".mo_custom_login_icon_preview").hide();
					jQuery(".mo_btn-defaulttheme").hide();
					jQuery(".mo_btn-customtheme").hide();
					jQuery(".mo_white_login_icon_preview").show();
					jQuery(".mo_discord_mo_btn-whitetheme").hide();

				}
			}
			previewLoginIcons();
		}

		function previewLoginIcons() {
			var apps;
			apps='<?php echo esc_attr( get_option( 'app_pos' ) ); ?>';
			apps=apps.split('#');
			for(i=0;i<apps.length;i++){
				if(jQuery('input[name=mo_discord_login_custom_theme]:checked', '#form-apps').val() == 'default')
				{
					if(jQuery('input[name=mo_discord_login_theme]:checked', '#form-apps').val() =='longbutton')
						jQuery("#mo_login_button_preview_"+apps[i]).show();
					else
						jQuery("#mo_login_icon_preview_"+apps[i]).show();
				}
				else if(jQuery('input[name=mo_discord_login_custom_theme]:checked', '#form-apps').val() == 'custom')
				{
					if(jQuery('input[name=mo_discord_login_theme]:checked', '#form-apps').val() == 'longbutton')
						jQuery("#mo_custom_login_button_preview_"+apps[i]).show();
					else
						jQuery("#mo_custom_login_icon_preview_"+apps[i]).show();
				}
				else if(jQuery('input[name=mo_discord_login_custom_theme]:checked', '#form-apps').val() == 'white')
				{
					if(jQuery('input[name=mo_discord_login_theme]:checked', '#form-apps').val() == 'longbutton')
						jQuery("#mo_white_login_button_preview_"+apps[i]).show();
					else
						jQuery("#mo_white_login_icon_preview_"+apps[i]).show();
				}
			}
		}
		checkLoginButton();
	</script>
	<?php
}
