<?php
/**
 * Discord configured app function.
 *
 * @package MO_DISCORD_INTEGRATOR
 */

/**
 * Undocumented function
 *
 * @return void
 */
function mo_discord_attribute_mapping() {
	$field = get_option( 'mo_discord_login_field_option' );
	?>

	<form id="dis_res" name="dis_res" method="post" action="">
		<input type="hidden" name="option" value="mo_discord_enable_attribute_mapping" />
		<input type="hidden" name="mo_discord_enable_attribute_mapping_nonce" value="<?php echo esc_attr( wp_create_nonce( 'mo-discord-enable-discord-restriction-nonce' ) ); ?>"/>
		<div class="mo_discord_table_layout" style="min-height: 350px" id="mo_discord_dis_res_layout"><br/>
			<div style=" background:white; float:left; border: 1px transparent;">
				<label style="cursor: auto;" class="mo_discord_note_style">Attributes received from Discord will be mapped to the WordPress user profile. Do <b>Test Configuration</b> to get configuration for attribute mapping.</label>

				<table class="form-table" role="presentation">
					<tbody>
					<tr class="form-field form-required">
						<th scope="row"><label for="">Username</label></th>
						<td><select id="mo_discord_attr_username" name="mo_discord_attr_username" style="width: 50%">
								<option value=" " <?php echo esc_attr( get_option( 'mo_discord_attr_display_name' ) ) === ' ' ? 'selected' : ' '; ?>>--select--</option>
								<?php foreach ( $field as $key ) { ?>
								<option value="<?php echo esc_attr( $key ); ?>" <?php echo esc_attr( get_option( 'mo_discord_attr_username' ) ) === $key ? 'selected' : ' '; ?>><?php echo esc_attr( ucfirst( $key ) ); ?></option>
								<?php } ?>
							</select>
						</td>
					</tr>
					<tr class="form-field form-required">
						<th scope="row"><label for="">Email:</label></th>
						<td><select style="width: 50%" id="mo_discord_attr_email" name="mo_discord_attr_email">
								<option  value=" " <?php echo esc_attr( get_option( 'mo_discord_attr_display_name' ) ) === ' ' ? 'selected' : ' '; ?>>--select--</option>
								<?php foreach ( $field as $key ) { ?>
									<option  value="<?php echo esc_attr( $key ); ?>" <?php echo esc_attr( get_option( 'mo_discord_attr_email' ) ) === $key ? 'selected' : ' '; ?>><?php echo esc_attr( ucfirst( $key ) ); ?></option>
								<?php } ?>
							</select>
						</td>
					</tr>
					<tr class="form-field form-required">
						<th scope="row"><label for="">Display Name:</label></th>
						<td><select style="width: 50%"  id="mo_discord_attr_display_name" name="mo_discord_attr_display_name" >
								<option value=" " <?php echo esc_attr( get_option( 'mo_discord_attr_display_name' ) ) === ' ' ? 'selected' : ' '; ?>>--select--</option>
								<?php foreach ( $field as $key ) { ?>
									<option value="<?php echo esc_attr( $key ); ?>" <?php echo esc_attr( get_option( 'mo_discord_attr_display_name' ) ) === $key ? 'selected' : ' '; ?>><?php echo esc_attr( ucfirst( $key ) ); ?></option>
								<?php } ?>

							</select>
						</td>
					</tr>
					</tbody></table>
					<br/><b style="padding: 10px"><input type="submit" name="submit" value="Save" style="width:150px;background-color:#0867b2;color:white;box-shadow:none;text-shadow: none;"  class="button button-primary button-large" /></b>

			</div>
		</div>
	</form>

	<form id="dis_basic_role" name="dis_basic_role" method="post" action="">
		<input type="hidden" name="option" value="mo_dis_basic_role_setting" />
		<input type="hidden" name="mo_dis_basic_role_setting_nonce" value="<?php echo esc_attr( wp_create_nonce( 'mo-dis-basic-role-setting-nonce' ) ); ?>"/>

		<div class="mo_discord_highlight" id="mo_dis_basic_role_mapping">
		<h3 style="margin-left: 2%;line-height: 210%;color: white;display: inline-block;">Role Mapping</h3>
		</div>
			<div style="padding:10px">
				<table class="form-table"><tbody>
					<tr class="form-field form-required">
				<th>Universal Role</th>
				<td><select name="mo_dis_basic_role_mapping" style="margin-left: 2%; color: #000000;width:20%;font-size: 15px; background-color: #d4d7ee" id="mo_dis_basic_role_mapping"> 
				<?php
				if ( get_option( 'mo_dis_basic_role_mapping' ) ) {
					$mo_default_role = get_option( 'mo_dis_basic_role_mapping' );
				} else {
					$mo_default_role = get_option( 'mo_default_role' );
				}
					wp_dropdown_roles( $mo_default_role );
				?>
				</select></td></tr><tbody></table>
				</div><br>
			<b style="padding: 10px"><input type="submit" name="submit" value="Save" style="width:150px;background-color:#0867b2;color:white;box-shadow:none;text-shadow: none;"  class="button button-primary button-large" /></b><br><br>
			<label style="cursor: auto" class="mo_discord_note_style"> Use Role Mapping to assign this role to the all users registering through Social Login. According to the role mapped user will be granted role on the website.</label><br>	
	</form>

	<div class="mo_discord_highlight" id="mo_discord_custom_attr_mapping">
		<h3 style="margin-left: 2%;line-height: 210%;color: white;display: inline-block;">Custom Attributes Mapping</h3>
	</div>
	<form>
		<table style="margin: 2% 0 0 2%;width: 70%;">
			<tr style="margin-left: 1.5%">
				<td>
					<input type="text" class="mo_discord_textfield_css" placeholder="Enter Attribute Name" disabled/>
				</td>
				<td>
					<select  name="mo_discord_set_attribute_value" style="width:100%"  disabled>
						<option value="user_login" >User Name</option>
					</select>
				</td></tr></table>
		<br><br><b style="padding: 25px"></bstyle><input type="submit" name="submit" value="Save" style="width: 150px"  class="button button-primary button-large" disabled/></b>
		<br><br> <label style="cursor: auto" class="mo_discord_note_style">&nbsp;&nbsp;These features are available in premium version only. To know more about the premium plugin <a target="_blank" href="https://plugins.miniorange.com/discord-wordpress-single-sign-on-integration">click here</a>.  <a style="left: 1%; position: relative; text-decoration: none" class="mo-discord-premium" href="<?php echo esc_url( add_query_arg( array( 'tab' => 'licensing_plans' ), isset( $_SERVER['REQUEST_URI'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) ) : '' ) ); ?>">PRO</a>&nbsp;&nbsp;</label>

	</form>
	<script>
		jQuery('#mo_discord_page_heading').text('Attribute Mapping');
		var temp = jQuery("<a style=\"left: 1%; padding:4px; position: relative; text-decoration: none\" class=\"mo-discord-premium\" href=\"<?php echo esc_url( add_query_arg( array( 'tab' => 'licensing_plans' ), isset( $_SERVER['REQUEST_URI'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) ) : '' ) ); ?>\">PRO</a>");
		jQuery("#mo_discord_custom_attr_mapping").append(temp);
	</script>
	<?php
}
