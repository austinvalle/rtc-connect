const DEBUG_AREA_TAG = document.querySelector('#debug-area');
const LOCAL_VIDEO_TAG = document.querySelector('video#local-video');

function debug(text) {
	console.log(text);
	DEBUG_AREA_TAG.textContent += `\n${text}`;
}

function ready(callback) {
	// in case the document is already rendered
	if (document.readyState != 'loading') callback();
	// modern browsers
	else if (document.addEventListener) document.addEventListener('DOMContentLoaded', callback);
	// IE <= 8
	else document.attachEvent('onreadystatechange', function () {
		if (document.readyState == 'complete') callback();
	});
}

ready(function () {
	console.log('let\'s gooooo');
	debug('INFO: Ready to connect!');

	navigator.mediaDevices.getUserMedia({ audio: true, video: true }).then(function (stream) {
		let tracks = stream.getTracks();
		tracks.forEach((track) => {
			debug(`INFO: Listing capabilities of '${track.kind}' stream from '${track.label}'`);
			debug(`${JSON.stringify(track.getCapabilities(), undefined, 2)}`)
		});

		LOCAL_VIDEO_TAG.srcObject = stream;
	}).catch(function (err) {
		debug(`ERR: Couldn't setup local media - '${err.message}'`)
	});
});
