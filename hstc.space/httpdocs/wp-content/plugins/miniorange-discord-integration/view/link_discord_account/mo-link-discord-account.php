<?php
/**
 * Link Social Account UI.
 *
 * @package MO_DISCORD_INTEGRATOR
 */

/**
 * Link Social Account UI.
 *
 * @return void
 */
function mo_link_discord_account() {
	?>
	<br/>
	<div class="mo_discord_table_layout">
			<table>
				<tr>
					<td colspan="2">
						<div>
							<label class="mo_discord_note_style">
									<?php echo 'Enable account linking to let your users link their Social accounts with existing WordPress account. Users will be prompted with the option to either link to any existing account using WordPress login page or register as a new user'; ?>.</label><br/><br/>
									<label style="cursor: auto" class="mo_discord_checkbox_container"><?php echo 'Enable linking of Social Accounts'; ?>
									<input disabled type="checkbox" id="account_linking_enable" name="mo_discord_account_linking_enable" value="1" />
									<span class="mo_discord_checkbox_checkmark"></span>
							</label>
						</div>
					</td>
				</tr>
					<tr id="account_link_customized_text"><td colspan="2"><h3 style="float: left"><?php echo 'Customize Text for Account Linking'; ?></h3></td></tr>
					<tr id="acc_link_img"><td colspan="2"></td></tr>
					<tr id="account_link_customized_text"><td class="mo_discord_fix_fontsize" style="width: 40%">1. <?php echo 'Enter title of Account linking form'; ?>:</td><td><input disabled class="mo_discord_textfield_css" style="border: 1px solid ;border-color: #0867b2" type="text" name="mo_account_linking_title" value="<?php echo esc_attr( get_option( 'mo_account_linking_title' ) ); ?>" /></td></tr>
					<tr id="account_link_customized_text"><td class="mo_discord_fix_fontsize" style="width: 40%">2. <?php echo 'Enter button text for create new user'; ?>:</td><td><input disabled class="mo_discord_textfield_css" style="border: 1px solid ;border-color: #0867b2" type="text" name="mo_account_linking_new_user_button" value="<?php echo esc_attr( get_option( 'mo_account_linking_new_user_button' ) ); ?>"/></td></tr>
					<tr id="account_link_customized_text">
						<td class="mo_discord_fix_fontsize" style="width: 40%">
							3. <?php echo 'Enter button text for Link to existing user'; ?>:</td><td><input disabled class="mo_discord_textfield_css" style="border: 1px solid ;border-color: #0867b2" type="text" name="mo_account_linking_existing_user_button" value="<?php echo esc_attr( get_option( 'mo_account_linking_existing_user_button' ) ); ?>"/></td></tr>
				<tr><td></td></tr>
					<tr id="account_link_customized_text"><td class="mo_discord_fix_fontsize" colspan="2">4. <?php echo 'Enter instruction to Create New Account'; ?> :<br/><input disabled class="mo_discord_textfield_css" style="border: 1px solid ;border-color: #0867b2;width: 98%" type="text" name="mo_account_linking_new_user_instruction" value="<?php echo esc_attr( get_option( 'mo_account_linking_new_user_instruction' ) ); ?>"/>
						</td>
					</tr>
				<tr><td></td></tr>
					<tr id="account_link_customized_text">
						<td class="mo_discord_fix_fontsize" colspan="2">
							5. <?php echo 'Enter instructions to link to an existing account'; ?> :<br/><input disabled class="mo_discord_textfield_css" style="border: 1px solid ;border-color: #0867b2;width: 98%" type="text" name="mo_account_linking_existing_user_instruction" value="<?php echo esc_attr( get_option( 'mo_account_linking_existing_user_instruction' ) ); ?>"/>
						</td>
					</tr>
				<tr><td></td></tr>
					<tr id="account_link_customized_text"><td disabled class="mo_discord_fix_fontsize" colspan="2"><?php echo 'Enter extra instructions for account linking'; ?> :<br/><input disabled class="mo_discord_textfield_css" style="border: 1px solid ;border-color: #0867b2;width: 98%" style="width:98%;margin-left: 0px;" type="text" name="mo_account_linking_extra_instruction" value="<?php echo esc_attr( get_option( 'mo_account_linking_extra_instruction' ) ); ?>"/>
						</td>
					</tr>
					<tr id="mo_discord_link_loggedin"><td colspan="2"> <br/>
								<label class="mo_discord_checkbox_container"><?php echo 'Linked users to loggedin user'; ?>
								<input disabled  type="checkbox" id="mo_discord_link_loggedin" name="mo_discord_link_loggedin" value="1" />
								<span class="mo_discord_checkbox_checkmark"></span>
								</label>
								<p><b>[miniorange_discord_login link_enable="1"]</b> use this shortcode to display icons on logged in users</p>
								</td></tr>
								<tr id="save_mo_btn"><td><br/><input disabled type="submit" name="submit" value="<?php echo 'Save'; ?>" style="width:150px;text-shadow: none;background-color:#0867b2;color:white;box-shadow:none;"  class="button button-primary button-large" /></td></tr>
					<tr id="acc_link"><td> </td></tr>
			</table>
			<br><br> <label style="cursor: auto" class="mo_discord_note_style">&nbsp;&nbsp;These features are available in premium version only. To know more about the premium plugin <a target="_blank" href="https://plugins.miniorange.com/discord-wordpress-single-sign-on-integration">click here</a>.  <a style="left: 1%; position: relative; text-decoration: none" class="mo-discord-premium" href="<?php echo esc_url( add_query_arg( array( 'tab' => 'licensing_plans' ), isset( $_SERVER['REQUEST_URI'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) ) : '' ) ); ?>">PRO</a>&nbsp;&nbsp;</label>
		</form>
	</div>
		<script>
		jQuery('#mo_discord_page_heading').text('Link Social Account');
		var temp = jQuery("<a style=\"left: 1%; padding:4px; position: relative; text-decoration: none\" class=\"mo-discord-premium\" href=\"<?php echo esc_url( add_query_arg( array( 'tab' => 'licensing_plans' ), isset( $_SERVER['REQUEST_URI'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) ) : '' ) ); ?>\">PRO</a>");
		jQuery("#mo_discord_page_heading").append(temp);
		var win_height = jQuery('#mo_discord_menu_height').height();
		jQuery(".mo_container").css({height:win_height});
		var custom_link;
		var custom_link_img;
		var custom_profile_img;
		id=document.getElementById('account_linking_enable');
		var checkbox1 = document.getElementById('account_linking_enable');
		jQuery(document).ready(function(){
				custom_link= 1;
				custom_link_img=1;
			}
		);
	</script>
	<?php

}
