export type DataPoint = {
	x: Date | string;
	y: number | null;
};

export type Response<DataType> = {
	status: 'OK' | 'ERROR';
	data?: DataType;
	error?: string;
};
