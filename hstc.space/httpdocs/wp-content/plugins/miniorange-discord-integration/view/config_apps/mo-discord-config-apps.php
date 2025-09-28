<?php
/**
 * Configure apps menu page.
 *
 * @package MO_DISCORD_INTEGRATOR
 */

/**
 * Configure apps menu page
 *
 * @return void
 */
function mo_discord_show_apps() {
	$app_data      = maybe_unserialize( get_option( 'mo_discord_login_app' ) );
	$client_id     = isset( $app_data['discord']['clientid'] ) ? $app_data['discord']['clientid'] : '';
	$client_secret = isset( $app_data['discord']['clientsecret'] ) ? $app_data['discord']['clientsecret'] : '';
	$scope         = isset( $app_data['discord']['scope'] ) ? $app_data['discord']['scope'] : 'identify+email';
	?>
<br>
	<div style="width: 40%; float: left; display: inline; border: solid 2px darkgray; border-radius: 10px;">
		<div>
			<center><h3 style="margin-bottom: 2%">App Settings</h3></center>
		</div>
		<div class="mo-discord-app-name" id="discord" style="width: 100%">
			<div style="padding: 0% 5% 5% 5%;">
				<div style="overflow: auto">
					<div style="float: left; width: 20%"><b>Client ID</b></div>
					<div style="float: right; width: 80%">
						<input id="app_id_value" type="text" style="width: 98%" value="<?php echo esc_attr( $client_id ); ?>">
					</div>
				</div>
				<div style="overflow: auto;margin-top: 10px;">
					<div style="float: left; width: 20%"><b>Client Secret</b></div>
					<div style="float: right; width: 80%">
						<input id="app_secret_value" type="text" style="width: 98%" value="<?php echo esc_attr( $client_secret ); ?>"> </div>
				</div>
				<div style="overflow: auto;margin-top: 10px;">
					<div style="float: left; width: 20%"><b>Scope</b></div>
					<div style="float: right; width: 80%">
						<input id="app_scope_value" type="text" style="width: 98%" value="<?php echo esc_attr( $scope ); ?>"> </div>
				</div>
				<div style="margin-top: 10px;margin-left: 13%;">
					<center>
						<input type="button" value="Save & Test Configuration" class="button button-primary button-large mo_discord_save_capp_settings">&nbsp;&nbsp;
						<input type="button" value="Clear Values" class="button button-primary button-large mo_discord_clear_capp_settings">
					</center>
				</div>
				<div style="margin-top: 10px;">
					<center>
						<p style="margin-bottom:auto">Have any configuration issues? <a style="cursor: pointer" onclick="mo_discord_support_form(this.id)">Contact Us</a> for help.</p>
					</center>
				</div>
				<div style="margin-top: 10px;">
					<center>
						<p style="margin-bottom:auto">Do you want to use Discord login icons on any particular theme? Go to <a style="cursor: pointer" href="<?php echo esc_url( add_query_arg( array( 'tab' => 'shortcodes' ), isset( $_SERVER['REQUEST_URI'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) ) : '' ) ); ?>">Shortcode Tab</a> . .</p>
					</center>
				</div>
			</div>
		</div>
	</div>
	<div id="mo_discord_cust_app_instructions" style="width: 59%; border: solid 2px darkgray; border-radius: 10px; float: right; display: block; height: auto; overflow-y: auto">
		<div>
			<center>
				<h3 id="custom_app_instructions">Instructions to configure Discord:</h3>
				<h4 id="mo_ssl_notice" style="color: rgb(0, 90, 255); margin-top: 0px; margin-bottom: 7px; display: none;"></h4>
				<h4 id="mo_app_config_notice" style="color:red;margin-top: 0px;margin-bottom: 0px;">If you face any issues in setting up Discord app then please contact us we will help you out</h4></center>
		</div>
		<ol id="custom_app_inst_steps">
			<li>Go to <a href="https://discordapp.com/developers" target="_blank">https://discordapp.com/developers/applications</a> and sign in with your discordapp developer account.</li>
			<li>On the page, Click on the <strong>New Application</strong> button and enter a <strong>Name</strong> for your app. Click on <b>Create</b>.</li>
			<li>Click on <strong>OAuth2</strong> form left section.</li>
			<li>Click on <b>Add redirect</b> and Enter <b><code id="15"><?php echo esc_url( mo_discord_get_permalink( 'discord' ) ); ?></code><i style="width: 11px;height: 9px;padding-left:2px;padding-top:3px" class="far fa-fw fa-lg fa-copy mo_discord_copy mo_discord_copytooltip" onclick="copyToClipboard(this, '#15', '#shortcode_url_copy')"><span id="shortcode_url_copy" class="mo_discord_copytooltiptext">Copy to Clipboard</span></i></b> in that. </li>
			<li>Copy the Client Id and Client Secret from the <b>General information</b> and Paste them into the fields above.</li>
			<li>Enter <b>identify+email</b> as Scope.</li>
			<li>Click on the Save settings button.</li>
			<li>Go to <b>Design Icon</b> tab to configure the display as well as other login settings.</li>
			<label class="mo_discord_note_style" style="cursor: auto">If you want to display Discord Login icon on your login panel then use <code id="1">[miniorange_discord_login]</code><i style="width: 11px;height: 9px;padding-left:2px;padding-top:3px" class="far fa-fw fa-lg fa-copy mo_discord_copy mo_discord_copytooltip" onclick="copyToClipboard(this, '#1', '#shortcode_url_copy1')"><span id="shortcode_url_copy1" class="mo_discord_copytooltiptext">Copy to Clipboard</span></i> to display Discord login icon or <a style="cursor: pointer" onclick="mo_discord_support_form('')">Contact Us</a></label>
		</ol>
		<div style="padding: 0px 10px 10px; display: none;" id="custom_app_perma_inst"><strong style="color: red;font-weight: bold"><br>You have selected plain permalink and <label id="mo_perma_error_app_name" style="display:contents"></label> does not support it.</strong>
			<br>
			<br> Please change the permalink to continue further.Follow the steps given below:
			<br>1. Go to settings from the left panel and select the permalinks option.
			<br>2. Plain permalink is selected ,so please select any other permalink and click on save button.
			<br> <strong class="mo_discord_note_style" style="color: red;font-weight: bold"> When you will change the permalink ,then you have to re-configure the already set up custom apps because that will change the redirect URL.</strong></div>
	</div>

	<div id="mo_discord_notice_snackbar">
		<label id="mo_discord_notice_message"></label>
	</div>
	<script>
		jQuery('#mo_discord_page_heading').text('Configure Discord Login');

		function mo_show_success_error_msg(msg_type,message) {
			jQuery('#mo_discord_notice_message').text(message);
			if(msg_type=='error')
				jQuery('#mo_discord_notice_snackbar').css("background-color","#c02f2f");
			else
				jQuery('#mo_discord_notice_snackbar').css("background-color","#4CAF50");
			var x = document.getElementById("mo_discord_notice_snackbar");
			x.className = "show";
			setTimeout(function(){ x.className = x.className.replace("show", ""); }, 4000);
		}

		jQuery(function() {
			jQuery('.mo_discord_save_capp_settings').click(function () {
				save_and_test();
			});
			jQuery('.mo_discord_clear_capp_settings').on('click',function () {
				let app_name = jQuery(".mo-discord-app-name").attr("id");
				var mo_discord_capp_delete_nonce = '<?php echo esc_attr( wp_create_nonce( 'mo-discord-capp-delete' ) ); ?>';
				jQuery.ajax({
					type: 'POST',
					url: '<?php echo esc_url( admin_url( 'admin-ajax.php' ) ); ?>',
					data: {
						'mo_discord_capp_delete_nonce': mo_discord_capp_delete_nonce,
						action: 'mo_discord_capp_delete',
						app_name: app_name,
					},
					success: function (data) {
						var mo_discord_toggle_update_nonce = '<?php echo esc_attr( wp_create_nonce( 'mo-discord-toggle-update-nonce' ) ); ?>';
						jQuery("#app_id_value").val('');
						jQuery("#app_secret_value").val('');
						jQuery("#app_scope_value").val('');
						jQuery.ajax({
							url:"<?php echo esc_url( admin_url( 'admin-ajax.php' ) ); ?>",
							'mo_discord_toggle_update_nonce': mo_discord_toggle_update_nonce,
							method: "POST",
							dataType: 'json',
							data: {
								action: 'mo_register_customer_toggle_update',
								app_name: app_name,
							},
							success: function(result){
								if(result.status){
									if (data.status=='1') {
										deactivate_app(app_name);
										mo_show_success_error_msg('success', 'App credentials has been removed and app is deactivated sucessfully.');
									}
									else
										mo_show_success_error_msg('success', 'App credentials has been removed sucessfully.');
								}
								else {
									deactivate_app(app_name);
									mo_show_success_error_msg('success', 'App credentials has been removed and app is deactivated sucessfully.');
								}
							}
						});
					},
					error: function (data) {
					}
				});
			});
			jQuery('.mo_do_not_register').on('click', function() {
				jQuery('#mo_discord_register_new_user').hide();
				jQuery('#mo_discord_register_old_user').hide();
				jQuery('#mo_discord_cust_app_instructions').show();
			});
		});

		function deactivate_app(app_name) {
			var mo_discord_disable_app_nonce = '<?php echo esc_attr( wp_create_nonce( 'mo-discord-disable-app-nonce' ) ); ?>';
			jQuery.ajax({
				url:"<?php echo esc_url( admin_url( 'admin-ajax.php' ) ); ?>",
				method: "POST",
				dataType: 'json',
				data: {
					app_name: app_name,
					'mo_discord_disable_app_nonce': mo_discord_disable_app_nonce,
					action: 'mo_discord_disable_app',
				},
				success: function(result){
					jQuery( "#mo_apps_".concat(app_name)).prop('checked', false);
				}
			});
		}

		function save_and_test() {
			let app_name = jQuery(".mo-discord-app-name").attr("id");
			let app_id = jQuery(".mo-discord-app-name").find("#app_id_value").val();
			let app_secret = jQuery(".mo-discord-app-name").find("#app_secret_value").val();
			let app_scope = jQuery(".mo-discord-app-name").find("#app_scope_value").val();
			if(app_id=="" || app_secret=="") {
				mo_show_success_error_msg('error','Please enter and save App Id and App secret');
			}
			else {
				var mo_discord_capp_details_nonce = '<?php echo esc_attr( wp_create_nonce( 'mo-discord-capp-details' ) ); ?>';
				var a=document.getElementById('mo_apps_'.concat(app_name));
				var enable_app='mo_'.concat(app_name).concat('_enable');
				jQuery( "#mo_apps_"+app_name).prop('checked', true);
				jQuery.ajax({
					type: 'POST',
					url: '<?php echo esc_url( admin_url( 'admin-ajax.php' ) ); ?>',
					data: {
						'mo_discord_capp_details_nonce': mo_discord_capp_details_nonce,
						action: 'mo_discord_capp_details',
						app_name: app_name,
						app_id: app_id,
						app_secret: app_secret,
						app_scope: app_scope,
					},
					success: function (data) {
						mo_show_success_error_msg('success','App credentials has been saved sucessfully.');
						mo_test_config();
					},
					error: function (data) {
					}
				});
			}
		}
		function mo_test_config(){
			var mo_discord_test_config_nonce = '<?php echo esc_attr( wp_create_nonce( 'mo-discord-test-config-nonce' ) ); ?>';
			let app_name = jQuery(".mo-discord-app-name").attr("id");
			jQuery.ajax({
				url:"<?php echo esc_url( admin_url( 'admin-ajax.php' ) ); ?>",
				method: "POST",
				dataType: 'text',
				data: {
					appname: app_name,
					test_configuration : true,
					'mo_discord_test_config_nonce' : mo_discord_test_config_nonce,
					action: 'mo_discord_test_configuration_update',
				},
				success:function(result){
					var myWindow = window.open('<?php echo esc_url( mo_discord_attribute_url() ); ?>' + '/?option=oauthredirect&app_name='+app_name+'&wp_nonce='+'<?php echo esc_attr( wp_create_nonce( 'mo-discord-oauth-app-nonce' ) ); ?>', "", "width=950, height=600");
				}
			});
		}

	</script>
	<?php
}
