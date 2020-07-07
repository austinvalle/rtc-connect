const DEBUG_AREA_TAG = document.querySelector('#debug-area');
const LOCAL_VIDEO_TAG = document.querySelector('video#local-video');
const START_CALL_BTN = document.querySelector('#start-call');
const JOIN_CALL_BTN = document.querySelector('#join-call');
const ICE_CONFIG_TEXT_AREA = document.querySelector('#local-ice-config');


const configuration = { 'iceServers': [{ 'urls': 'stun:stun.l.google.com:19302' }] };
const peerConnection = new RTCPeerConnection(configuration);

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

ready(async function () {
	START_CALL_BTN.addEventListener('click', createCall)
	JOIN_CALL_BTN.addEventListener('click', joinCall)
});

async function createCall() {
	let stream = null;
	try {
		stream = await getLocalStream();
	} catch (err) {
		debug(`ERR: Couldn't setup local media - '${err.message}'`)
	}

	try {
		peerConnection.addStream(stream);
		const offer = await peerConnection.createOffer();
		await peerConnection.setLocalDescription(offer);

		peerConnection.addEventListener('icecandidate', async (event) => {
			if (event.candidate && !ICE_CONFIG_TEXT_AREA.innerHTML) {
				ICE_CONFIG_TEXT_AREA.textContent = JSON.stringify(peerConnection.localDescription);
				ICE_CONFIG_TEXT_AREA.disabled = false;
				ICE_CONFIG_TEXT_AREA.select();
				ICE_CONFIG_TEXT_AREA.setSelectionRange(0, 99999);
				document.execCommand("copy");

				let answerString = prompt('Enter in answer: ');
				let answer = JSON.parse(answerString);
				await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
			}
		});

		peerConnection.addEventListener('icegatheringstatechange', event => {
			console.log(JSON.stringify(event));
		});
		console.log('done');
	} catch (error) {
		debug(`ERR: Couldn't establish connection - '${err.message}'`)
	}
}

async function joinCall() {
	let offerString = prompt('Enter in offer: ');
	let offer = JSON.parse(offerString);

	let stream = null;
	try {
		stream = await getLocalStream();
	} catch (err) {
		debug(`ERR: Couldn't setup local media - '${err.message}'`)
	}


	peerConnection.addEventListener('icegatheringstatechange', event => {
		console.log(JSON.stringify(event));
	});

	peerConnection.addStream(stream);
	await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
	const answer = await peerConnection.createAnswer();
	await peerConnection.setLocalDescription(answer);

	ICE_CONFIG_TEXT_AREA.textContent = JSON.stringify(peerConnection.localDescription);
	ICE_CONFIG_TEXT_AREA.disabled = false;
	ICE_CONFIG_TEXT_AREA.select();
	ICE_CONFIG_TEXT_AREA.setSelectionRange(0, 99999);
	document.execCommand("copy");
}

async function getLocalStream() {
	let stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
	let tracks = stream.getTracks();
	tracks.forEach((track) => {
		debug(`INFO: Listing capabilities of '${track.kind}' stream from '${track.label}'`);
		debug(`${JSON.stringify(track.getCapabilities(), undefined, 2)}`)
	});

	LOCAL_VIDEO_TAG.srcObject = stream;

	return stream;
}
