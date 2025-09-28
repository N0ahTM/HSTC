<?php
/**
 * Woocommerce Integration UI.
 *
 * @package MO_DISCORD_INTEGRATOR
 */

/**
 * Woocommerce Integration UI.
 *
 * @return void
 */
function mo_woocommerce_integration() {

	?>
	<br><br>
	<div style="display:flex;justify-content:center">
		<div class="mo_discord_card-1 mo_discord_card-style">
		<img class="mo_woo_discord_img" src="<?php echo esc_attr( plugin_dir_url( dirname( dirname( __FILE__ ) ) ) ); ?>includes/images/woocommerce.png">
		</div>
		<div class="mo_discord_card-2 mo_discord_card-style">
		<img class="mo_woo_discord_ar" src="<?php echo esc_attr( plugin_dir_url( dirname( dirname( __FILE__ ) ) ) ); ?>includes/images/arrows.png">
		</div>
		<div class="mo_discord_card-1 mo_discord_card-style">
		<img class="mo_woo_discord_img" src="<?php echo esc_attr( plugin_dir_url( dirname( dirname( __FILE__ ) ) ) ); ?>includes/images/discord.png">
		</div>
		<div class="mo_discord_card-2 mo_discord_card-style">
		<img class="mo_woo_discord_ar" src="<?php echo esc_attr( plugin_dir_url( dirname( dirname( __FILE__ ) ) ) ); ?>includes/images/arrows.png">
		</div>
		<div class="mo_discord_card-1 mo_discord_card-style">
		<img class="mo_woo_discord_img" src="<?php echo esc_attr( plugin_dir_url( dirname( dirname( __FILE__ ) ) ) ); ?>includes/images/wordpress.png">
		</div>
	</div><br><br>
	<div class="mo_discord_table_layout">
	<form id="dis_int" name="dis_int" method="post" action="">
		<input type="hidden" name="option" value="mo_woocommerce_integration" />
		<input type="hidden" name="mo_woocommerce_integration_nonce" value="<?php echo esc_attr( wp_create_nonce( 'mo_woocommerce_integration-nonce' ) ); ?>"/>
		<table class="mo_discord_settings_table">
		<tr>
			<td>
		<p>
			<label class="mo_discord_checkbox_container_disable">
				<b><font color="#FF0000">*</font>Notify on discord server about the order placed on woocommerce</b>
				<input style="position: absolute; left:0;top: 88%" required type="checkbox" name="mo_dis_woo_order_place"/>
				<span class="mo_discord_checkbox_checkmark"></span>
			</label>
		</p>
</td>
<td>
		<p>
			<label class="mo_discord_checkbox_container_disable">
				<b><font color="#FF0000">*</font>Notify on discord server, when new user creation on WordPress</b>
				<input style="position: absolute; left:0;top: 88%" required type="checkbox" name="mo_dis_woo_order_place" di/>
				<span class="mo_discord_checkbox_checkmark"></span>
			</label>
		</p>
</td>
<tr>
</table>
		<input type="submit" name="Save" value="Submit" class="button button-primary button-large" disabled>
	</form>
	<br>
	<label style="cursor: auto" class="mo_discord_note_style">
					These features are available in premium version only. To know more about the premium plugin
					<a target="_blank" href="https://plugins.miniorange.com/discord-wordpress-single-sign-on-integration">click here</a>.
					<a style="left: 1%; position: relative; text-decoration: none" class="mo-discord-premium" href="<?php echo esc_url( add_query_arg( array( 'tab' => 'licensing_plans' ), isset( $_SERVER['REQUEST_URI'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) ) : '' ) ); ?>">
						PRO
					</a>&nbsp;&nbsp;&nbsp;&nbsp;
				</label>
</div>

	<script>
		jQuery('#mo_discord_page_heading').text('Woocommerce Integration');
		var temp = jQuery("<a style=\"left: 1%; padding:4px; position: relative; text-decoration: none\" class=\"mo-discord-premium\" href=\"<?php echo esc_url( add_query_arg( array( 'tab' => 'licensing_plans' ), isset( $_SERVER['REQUEST_URI'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) ) : '' ) ); ?>\">PRO</a>");
		jQuery("#mo_discord_page_heading").append(temp);
	</script>
	<?php

}

?>
