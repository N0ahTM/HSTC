<?php
/**
 * WordPress to discord Role mapping.
 * Discord to WordPress Role mapping
 * Configuration tabs
 *
 * @package MO_DISCORD_INTEGRATOR
 */

/**
 * WordPress to discord Role mapping
 *
 * @return void
 */
function mo_discord_role_mapping() {
	global $wp_roles;
	$roles = $wp_roles->get_names();
	?>

	<form id="dis_rol" name="dis_rol" method="post" action="">
		<input type="hidden" name="option" value="mo_dis_enable_discord_role_mapping" />
		<input type="hidden" name="mo_dis_enable_discord_role_mapping_nonce" value="<?php echo esc_attr( wp_create_nonce( 'mo-discord-enable-discord-role-mapping-nonce' ) ); ?>" />
		<div class="mo_discord_table_layout" id="mo_discord_dis_role_layout">
			<br/>
			<div style=" background:white; float:left; border: 1px transparent;">
				<p class="mo-discord-heading-tab">In WordPress to Discord Role Mapping, When a user registers using Discord Login to your website, they will be automatically added to your Discord Server, and their WordPress role will get mapped to the corresponding Discord Role. </p>
				<br>
				<table class="form-table" role="presentation">
					<tbody>
					<?php
					foreach ( $roles as $role ) {
						?>
						<tr class="form-field form-required">
							<th scope="row">
								<label for="">
									<?php echo esc_attr( $role ); ?></label>
							</th>
							<td>
								<select style="width: 60%; text-align:center" disabled><option>--Select--</option></select> </td>
						</tr>
					<?php } ?>
					</tbody>
				</table>
				<center>
					<br/><b style="padding: 10px"><input type="submit" name="submit" value="Save" style="width:150px;background-color:#0867b2;color:white;box-shadow:none;text-shadow: none;"  class="button button-primary button-large" disabled/></b> </center>
				<br>
				<br>
				<label style="cursor: auto" class="mo_discord_note_style">
					These features are available in premium version only. To know more about the premium plugin
					<a target="_blank" href="https://plugins.miniorange.com/discord-wordpress-single-sign-on-integration">click here</a>.
					<a style="left: 1%; position: relative; text-decoration: none" class="mo-discord-premium" href="<?php echo esc_url( add_query_arg( array( 'tab' => 'licensing_plans' ), isset( $_SERVER['REQUEST_URI'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) ) : '' ) ); ?>">
						PRO
					</a>&nbsp;&nbsp;&nbsp;&nbsp;
				</label>
			</div>
		</div>
	</form>
	<script>
		jQuery('#mo_discord_page_heading').text('WordPress To Discord Role Mapping');
		var temp = jQuery("<a style=\"left: 1%; padding:4px; position: relative; text-decoration: none\" class=\"mo-discord-premium\" href=\"<?php echo esc_url( add_query_arg( array( 'tab' => 'licensing_plans' ), isset( $_SERVER['REQUEST_URI'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) ) : '' ) ); ?>\">PRO</a>");
		jQuery("#mo_discord_page_heading").append(temp);
	</script>
	<?php
}

/**
 * Discord to WordPress Role mapping
 *
 * @return void
 */
function mo_discord_2_wp_role_mapping() {
	global $wp_roles;
	$roles = $wp_roles->get_names();
	$roles = isset( $roles ) ? $roles : '';
	?>

	<form id="dis_rol" name="dis_rol" method="post" action="">
		<input type="hidden" name="option" value="mo_dis_enable_discord_role_mapping" />
		<input type="hidden" name="mo_dis_enable_discord_role_mapping_nonce" value="<?php echo esc_attr( wp_create_nonce( 'mo-discord-enable-discord-role-mapping-nonce' ) ); ?>"/>
		<div class="mo_discord_table_layout" id="mo_discord_dis_role_layout"><br/>
			<div style=" background:white; float:left; border: 1px transparent;">
				<p class="mo-discord-heading-tab">Discord to WordPress Role Mapping, Maps the users' role from Discord to WordPress when the user registers/login to your website.</p>
				<br>

				<table class="form-table" role="presentation">
					<tbody>
						<tr class="form-field form-required">
						<td>Discord Role</td><td>WordPress Role</td>
						</tr>
						<tr class="form-field form-required">
							<td scope="row"><select style="width: 60%;opacity: 0.5"><option>--Select Discord Role--</option></select></td>
							<td>
								<select style="width: 50%;opacity: 0.5">
								<?php
								if ( $roles ) {
									foreach ( $roles as $role ) {
										?>
									<option value="<?php echo esc_attr( $role ); ?>"><?php echo esc_attr( ucfirst( $role ) ); ?></option>
										<?php
									}
								}
								?>
								</select></td>
							<td>
								<input type="button" disabled="disabled" value="+" onclick="add_custom_field();" class=" button-primary">
								<input type="button" disabled="disabled" value="-" onclick="add_custom_field();" class=" button-primary">
							</td>
							</tr>
						</tbody></table>

					<br/><b style="padding: 10px"><input type="submit" name="submit" value="Save" style="width:150px;background-color:#0867b2;color:white;box-shadow:none;text-shadow: none;"  class="button button-primary button-large" disabled/></b>


				<br><br> <label style="cursor: auto" class="mo_discord_note_style">&nbsp;&nbsp;&nbsp;&nbsp;These features are available in premium version only. To know more about the premium plugin <a target="_blank" href="https://plugins.miniorange.com/discord-wordpress-single-sign-on-integration">click here</a>.  <a style="left: 1%; position: relative; text-decoration: none" class="mo-discord-premium" href="<?php echo esc_url( add_query_arg( array( 'tab' => 'licensing_plans' ), isset( $_SERVER['REQUEST_URI'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) ) : '' ) ); ?>">PRO</a></label>
			</div>
		</div>
	</form>
	<script>
		jQuery('#mo_discord_page_heading').text('Discord To WordPress Role Mapping');
		var temp = jQuery("<a style=\"left: 1%; padding:4px; position: relative; text-decoration: none\" class=\"mo-discord-premium\" href=\"<?php echo esc_url( add_query_arg( array( 'tab' => 'licensing_plans' ), isset( $_SERVER['REQUEST_URI'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) ) : '' ) ); ?>\">PRO</a>");
		jQuery("#mo_discord_page_heading").append(temp);
	</script>
	<?php
}


/**
 * Discord configurtaion Tab
 *
 * @return void
 */
function mo_discord_integration() {

	?>

	<form id="dis_int" name="dis_int" method="post" action="">
		<input type="hidden" name="option" value="mo_discord_enable_discord_integration" />
		<input type="hidden" name="mo_discord_enable_discord_integration_nonce" value="<?php echo esc_attr( wp_create_nonce( 'mo-discord-enable-discord-integration-nonce' ) ); ?>"/>
		<div class="mo_discord_table_layout" id="mo_discord_dis_int_layout"><br/>
			<div style=" background:white; float:left; border: 1px transparent;">

				<table class="form-table" role="presentation">
					<tbody>
					<tr class="form-field form-required">
						<th scope="row"><label for="">Guild ID\'s<span class="description">(required)</span></label></th>
						<td><input disabled type="text" placeholder="Enter your discord server Guild ID here">
						</td>
					</tr>
					<tr class="form-field form-required">
						<th scope="row"><label for="">Bot Token Key<span class="description">(required)</span></label></th>
						<td><input disabled type="text" placeholder="Enter Bot Token here"/>
						</td>
					</tr>
					<tr>
						<td colspan="2">
							<hr>
						</td>
					</tr>
					<tr class="form-field form-required">
						<td scope="row" colspan="2"><input disabled type="radio" checked/><label for="">If the user is not already a member of the discord server, add them at the time of registration/login via discord on the website. </label></td>
					</tr>
					<tr class="form-field form-required">
						<td scope="row" colspan="2"><input disabled type="radio"/><label for="">Allow users to register/login to your website via Discord only if it is available on the Discord Server.</label><br>&nbsp;&nbsp;&nbsp;&nbsp;Note: <p style="color:grey;font-size:1em;display: inline-block">This feature is opposite to the feature above. Please check the suitable option based on your requirement</p></td>
					</tr>
					</tbody></table>
					<br/><b style="padding: 10px"><input type="submit" name="submit" value="Save" style="width:150px;background-color:#0867b2;color:white;box-shadow:none;text-shadow: none;"  class="button button-primary button-large" disabled/></b><br><br>    
				<br> <label style="cursor: auto" class="mo_discord_note_style">&nbsp;&nbsp;&nbsp;&nbsp;These features are available in premium version only. To know more about the premium plugin <a target="_blank" href="https://plugins.miniorange.com/discord-wordpress-single-sign-on-integration">click here</a>.  <a style="left: 1%; position: relative; text-decoration: none" class="mo-discord-premium" href="<?php echo esc_url( add_query_arg( array( 'tab' => 'licensing_plans' ), isset( $_SERVER['REQUEST_URI'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) ) : '' ) ); ?>">PRO</a></label>
			</div>
		</div>
	</form>
	<script>
		jQuery('#mo_discord_page_heading').text('Discord Server Configuration');
		var temp = jQuery("<a style=\"left: 1%; padding:4px; position: relative; text-decoration: none\" class=\"mo-discord-premium\" href=\"<?php echo esc_url( add_query_arg( array( 'tab' => 'licensing_plans' ), isset( $_SERVER['REQUEST_URI'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) ) : '' ) ); ?>\">PRO</a>");
		jQuery("#mo_discord_page_heading").append(temp);
	</script>
	<?php
}

/**
 * Membership configuration tab
 *
 * @return void
 */
function mo_mem_2_discord_role_mapping() {
	?>
	<form id="dis_int" name="dis_int" method="post" action="">
		<input type="hidden" name="option" value="mo_mem_2_discord_role_mapping" />
		<input type="hidden" name="mo_mem_2_discord_role_mapping_nonce" value="<?php echo esc_attr( wp_create_nonce( 'mo-mem-2-discord-role-mapping-nonce' ) ); ?>"/>
		<div class="mo_discord_table_layout" id="mo_discord_dis_int_layout"><br/> 
			<div class="mo-discord-mem-dis-container" onclick="moDropdownToggle(document.getElementById('mo-discord-mem-dis-img'))">
			<h3 class="mo-discord-dropdown-heading-style">PaidMembership Pro to Discord Integration</h3>
				<i class="mo-discord-dropdown-arrow"></i>
				<div id="mo-discord-mem-dis-img" class="mo-discord-mem-dis-img mo-discord-mem-dis-dropdown">
					<img src="<?php echo esc_attr( plugin_dir_url( dirname( dirname( __FILE__ ) ) ) ); ?>includes/images/paidmember.png">
					<img src="<?php echo esc_attr( plugin_dir_url( dirname( dirname( __FILE__ ) ) ) ); ?>includes/images/connect.png" style="  transform: rotate(45deg) scale(2.2);">
					<i class="fab fa-discord" ></i>
					<br><hr><br>
					<div style="text-align: center">
					<label class="mo_discord_mem_dis_checkbox_enable" ><strong></strong>
						<input type="checkbox" name="mo_openid_discord_enable_check" value="1" <?php checked( get_option( 'mo_openid_discord_enable_check' ) === 1 ); ?>  />
						<span class="mo_discord_mem_dis_checkbox_slider"></span>
					</label>
					</div>
					<br><br>
					<table class="mo-discord-dis-mem-table">
					<tr>
						<th>Membership Level</th>
						<th>Discord Role</th>
					</tr>
					<tr>
					<td> Level 1 </td>
					<td>
						<select>
							<option>--Select Discord Role--</option>
						</select>
					</td>
					</tr>
					<tr>
					<td> Level 2 </td>
					<td>
						<select>
							<option>--Select Discord Role--</option>
						</select>
					</td>
					</tr>
				</table>
				<input type="submit" value="Submit" class="button button-primary button-large" disabled>
				<br><br>

			</div>

			</div>
			<div class="mo-discord-mem-dis-container" onclick="moDropdownToggle(document.getElementById('mo-discord-mem-press-img'))">
			<h3 class="mo-discord-dropdown-heading-style">Memberpress to Discord Integration</h3>
			<i class="mo-discord-dropdown-arrow"></i>
				<div id="mo-discord-mem-press-img" class="mo-discord-mem-dis-img mo-discord-mem-dis-dropdown">
					<img src="<?php echo esc_attr( plugin_dir_url( dirname( dirname( __FILE__ ) ) ) ); ?>includes/images/memberpress.png">
					<img src="<?php echo esc_attr( plugin_dir_url( dirname( dirname( __FILE__ ) ) ) ); ?>includes/images/connect.png" style="  transform: rotate(45deg) scale(2.2);">
					<i class="fab fa-discord" ></i>
					<br><hr><br>
					<div style="text-align: center">
					<label class="mo_discord_mem_dis_checkbox_enable" ><strong></strong>
						<input type="checkbox" name="mo_openid_discord_enable_check" value="1" <?php checked( get_option( 'mo_openid_discord_enable_check' ) === 1 ); ?>  />
						<span class="mo_discord_mem_dis_checkbox_slider"></span>
					</label>
					</div>
					<br><br>
					<table class="mo-discord-dis-mem-table">
					<tr>
						<th>Membership Level</th>
						<th>Discord Role</th>
					</tr>
					<tr>
					<td> Level 1 </td>
					<td>
						<select>
							<option>--Select Discord Role--</option>
						</select>
					</td>
					</tr>
					<tr>
					<td> Level 2 </td>
					<td>
						<select>
							<option>--Select Discord Role--</option>
						</select>
					</td>
					</tr>
				</table>
				<input type="submit" value="Submit" class="button button-primary button-large" disabled>
				<br><br>

			</div>
			</div>
			<div class="mo-discord-mem-dis-container" onclick="moDropdownToggle(document.getElementById('mo-discord-mem-woo-img'))">
			<h3 class="mo-discord-dropdown-heading-style">WooCommerce to Discord Integration</h3>
			<i class="mo-discord-dropdown-arrow"  ></i>
				<div id="mo-discord-mem-woo-img" class="mo-discord-mem-dis-img mo-discord-mem-dis-dropdown">
					<img src="<?php echo esc_attr( plugin_dir_url( dirname( dirname( __FILE__ ) ) ) ); ?>includes/images/woocommerce.png">
					<img src="<?php echo esc_attr( plugin_dir_url( dirname( dirname( __FILE__ ) ) ) ); ?>includes/images/connect.png" style="  transform: rotate(45deg) scale(2.2);">
					<i class="fab fa-discord" ></i>
					<br><hr><br>
					<div style="text-align: center">
					<label class="mo_discord_mem_dis_checkbox_enable" ><strong></strong>
						<input type="checkbox" name="mo_openid_discord_enable_check" value="1" <?php checked( get_option( 'mo_openid_discord_enable_check' ) === 1 ); ?>  />
						<span class="mo_discord_mem_dis_checkbox_slider"></span>
					</label>
					</div>
					<br><br>
					<table class="mo-discord-dis-mem-table">
					<tr>
						<th>Membership Level</th>
						<th>Discord Role</th>
					</tr>
					<tr>
					<td> Level 1 </td>
					<td>
						<select>
							<option>--Select Discord Role--</option>
						</select>
					</td>
					</tr>
					<tr>
					<td> Level 2 </td>
					<td>
						<select>
							<option>--Select Discord Role--</option>
						</select>
					</td>
					</tr>
				</table>
				<input type="submit" value="Submit" class="button button-primary button-large" disabled>
				<br><br>

			</div>
			</div>
				<label style="cursor: auto" class="mo_discord_note_style">&nbsp;&nbsp;&nbsp;&nbsp;These features are available in premium version only. To know more about the premium plugin <a target="_blank" href="https://plugins.miniorange.com/discord-wordpress-single-sign-on-integration">click here</a>.  <a style="left: 1%; position: relative; text-decoration: none" class="mo-discord-premium" href="<?php echo esc_url( add_query_arg( array( 'tab' => 'licensing_plans' ), isset( $_SERVER['REQUEST_URI'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) ) : '' ) ); ?>">PRO</a></label>
		</div>
	</form>
	<script>
		jQuery('#mo_discord_page_heading').text('Membership/Subscription based Role Mapping');
		function moDropdownToggle(element){
				element.classList.toggle("mo-discord-mem-dis-dropdown");          
		}
	</script>
	<?php
}
