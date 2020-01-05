//
// Texture Picker
//

window.onload = function() {
	console.log("你不乖哦，onload");
	// Handle Texture Picker
	const $picker = document.querySelector('#texture-picker');
	const $hidePicker = document.querySelector('#hidePicker');
	const $header = document.querySelector('header');
	
	$picker.onclick = function(e) {
		const textureName = e.target.id;
		if (textureName && textureName != 'texture-picker' && textureName != 'hidePicker') {
			$header.setAttribute('class', `texture-${textureName}`);
		}
	}

	$hidePicker.onclick = function () {
		$picker.style['display'] = 'none';	
	}
}