onmessage = e => {

	const data = e.data.data;

	const numberOfChannels = e.data.numberOfChannels;
	const duration = e.data.duration;
	const sampleRate = e.data.sampleRate;

	const initialPitch = e.data.initialPitch;
	const timeBetweenSteps = e.data.timeBetweenSteps;
	const timeUntilFirstChange = e.data.timeUntilFirstChange;
	const enableRandomPitchChange = e.data.enableRandomPitchChange;
	const minPitch = e.data.minPitch;
	const maxPitch = e.data.maxPitch;
	const timeMinBetweenChanges = e.data.timeMinBetweenChanges;
	const timeMaxBetweenChanges = e.data.timeMaxBetweenChanges;
	const sinePhaseSpeed = e.data.sinePhaseSpeed;
	const sinePitchMagnitude = e.data.sinePitchMagnitude;

	let newData = data.map(channelData => {
		return new Array(channelData.length);
	})

	let basePitch = initialPitch;
	let currentPitch = basePitch;

	let timeNextStep = timeBetweenSteps;
	let timeNextChange = timeUntilFirstChange;

	let newSample = 0;
	let time = 0;

	while (time < duration) {
		const newTime = newSample / sampleRate;

		if (enableRandomPitchChange) {
			if (newTime >= timeNextChange) {
				basePitch = randomRange(minPitch, maxPitch);
				timeNextChange += randomRange(timeMinBetweenChanges, timeMaxBetweenChanges);
			}
		}

		if (newTime >= timeNextStep) {
			currentPitch = basePitch + Math.sin(newTime * sinePhaseSpeed) * sinePitchMagnitude;
			timeNextStep += timeBetweenSteps;
		}

		const sample = time * sampleRate;
		const sampleLeft = Math.floor(sample);
		const sampleRight = sampleLeft + 1;
		const remainder = sample % 1;

		for (let i = 0; i < numberOfChannels; ++i) {
			newData[i][newSample] = ((1-remainder) * data[i][sampleLeft]) + ((remainder) * (data[i][sampleRight] ?? 0));
		}

		newSample++;
		time += (1 / sampleRate) * currentPitch;
	}

	newData = newData.map(newChannelData => {
		newChannelData.length = newSample;
		return Float32Array.from(newChannelData);
	})

	postMessage({
		data: newData,
		length: newSample,
	});
}

const randomRange = (min, max) => Math.random() * (max - min) + min;