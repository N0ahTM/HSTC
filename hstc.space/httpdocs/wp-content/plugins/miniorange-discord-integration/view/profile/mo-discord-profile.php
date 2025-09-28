<?php
/**
 * Discord profile UI.
 *
 * @package MO_DISCORD_INTEGRATOR
 */

/**
 * Discord profile UI
 *
 * @return void
 */
function mo_discord_profile() {
	if ( ( get_option( 'mo_discord_verify_customer' ) === 'true' ) || ( trim( get_option( 'mo_discord_admin_email' ) ) !== '' && trim( get_option( 'mo_discord_admin_api_key' ) ) === '' && get_option( 'mo_discord_new_registration' ) !== 'true' ) ) {
		mo_discord_show_verify_password_page();
	} elseif ( ! mo_discord_is_customer_registered() ) {
		update_option( 'regi_pop_up', 'no' );
		update_option( 'mo_discord_new_registration', 'true' );
		$current_user = wp_get_current_user();
		?>
			<!--Register with miniOrange-->
			<form name="f" method="post" action="" id="register-form">
				<input type="hidden" name="option" value="mo_discord_connect_register_customer" />
				<input type="hidden" name="mo_discord_connect_register_nonce" value="<?php echo esc_attr( wp_create_nonce( 'mo-discord-connect-register-nonce' ) ); ?>"/>
				<div class="mo_discord_table_layout">
					<h3>Register with miniOrange</h3>
					<p style="font-size:14px;"><b>Why should I register?</b></p>
					<div id="help_register_desc" style="background: aliceblue; padding: 10px 10px 10px 10px; border-radius: 10px;">
						You should register so that in case you need help, we can help you with step by step instructions. <b>You will also need a miniOrange account to upgrade to the premium version of the plugins.</b> We do not store any information except the email that you will use to register with us.
					</div><br/>
					<table class="mo_discord_settings_table" style="padding-right: 20%">
						<tr>
							<td><b><font color="#FF0000">*</font>Email:</b></td>
							<td><input class="mo_discord_textfield_css" style="border: 1px solid ;border-color: #0867b2;width: 80%" type="email" name="email"
									required placeholder="person@example.com"
									value="<?php echo esc_attr( $current_user->user_email ); ?>" /></td>
						</tr>
						<tr>
							<td><b><font color="#FF0000">*</font>Password:</b></td>
							<td><input class="mo_discord_textfield_css" style="border: 1px solid ;border-color: #0867b2;width: 80%" required type="password"
									name="password" placeholder="Choose your password (Min. length 6)" /></td>
						</tr>
						<tr>
							<td><b><font color="#FF0000">*</font>Confirm Password:</b></td>
							<td><input class="mo_discord_textfield_css" style="border: 1px solid ;border-color: #0867b2;width: 80%" required type="password"
									name="confirmPassword" placeholder="Confirm your password" /></td>
						</tr>
						<tr>
							<td>&nbsp;</td>
							<td><br /><input type="submit" name="submit" value="Register" style="width:auto;"
									class="button button-primary button-large" />
								<input type="button" value="Already have an Account?" id="mo_discord_go_back_registration" style="width:auto; margin-left: 2%"
									class="button button-primary button-large" />
							</td>
						</tr>
					</table>
					<br/>By clicking Submit, you agree to our <a href="https://www.miniorange.com/usecases/miniOrange_Privacy_Policy.pdf" target="_blank">Privacy Policy</a> and <a href="https://www.miniorange.com/usecases/miniOrange_User_Agreement.pdf" target="_blank">User Agreement</a>.
				</div>
			</form>
			<form name="f" method="post" action="" id="discordgobackloginform">
				<input type="hidden" name="option" value="mo_discord_go_back_registration"/>
				<input type="hidden" name="mo_discord_go_back_registration_nonce"
				value="<?php echo esc_attr( wp_create_nonce( 'mo-discord-go-back-register-nonce' ) ); ?>"/>
			</form>
			<script>
				jQuery('#mo_discord_go_back_registration').click(function() {
					jQuery('#discordgobackloginform').submit();
				});
				var text = "&nbsp;&nbsp;We will call only if you need support."
				jQuery('.intl-number-input').append(text);

			</script>
		<?php
	} else {
		?>
		<div class="mo_discord_table_layout">
			<h2>Thank you for registering with miniOrange.</h2>
			<table border="1" style="background-color:#FFFFFF; border:1px solid #CCCCCC; border-collapse: collapse; padding:0px 0px 0px 10px; margin:2px; width:85%">
				<tbody><tr>
					<td style="width:45%; padding: 10px;">miniOrange Account Email</td>
					<td style="width:55%; padding: 10px;"><?php echo esc_attr( get_option( 'mo_discord_admin_email' ) ); ?></td>
				</tr>
				<tr>
					<td style="width:45%; padding: 10px;">Customer ID</td>
					<td style="width:55%; padding: 10px;"><?php echo esc_attr( get_option( 'mo_discord_admin_customer_key' ) ); ?></td>
				</tr>
				</tbody>
			</table>
			<br/><label style="cursor: auto"><a href="<?php echo esc_url( add_query_arg( array( 'tab' => 'licensing_plans' ), isset( $_SERVER['REQUEST_URI'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) ) : '' ) ); ?>">Click here</a> to check our <a style="left: 1%; position: static; text-decoration: none" class="mo-discord-premium" href="<?php echo esc_url( add_query_arg( array( 'tab' => 'licensing_plans' ), isset( $_SERVER['REQUEST_URI'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) ) : '' ) ); ?>">PRO</a> plans</label>
		</div>
		<?php
	}
	?>
	<script>
		jQuery('#mo_discord_page_heading').text('User Profile Details');
		var win_height = jQuery('#mo_discord_menu_height').height();
		jQuery(".mo_container").css({height:win_height});
	</script>
	<?php
}
