/// Modelo para representar una predicción de lugar del Places API
class PlacePrediction {
  final String placeId;
  final String description;
  final String? mainText;
  final String? secondaryText;

  const PlacePrediction({
    required this.placeId,
    required this.description,
    this.mainText,
    this.secondaryText,
  });

  factory PlacePrediction.fromJson(Map<String, dynamic> json) {
    final structuredFormatting =
        json['structured_formatting'] as Map<String, dynamic>?;

    return PlacePrediction(
      placeId: json['place_id'] as String,
      description: json['description'] as String,
      mainText: structuredFormatting?['main_text'] as String?,
      secondaryText: structuredFormatting?['secondary_text'] as String?,
    );
  }

  @override
  String toString() {
    return 'PlacePrediction(placeId: $placeId, description: $description)';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is PlacePrediction && other.placeId == placeId;
  }

  @override
  int get hashCode => placeId.hashCode;
}
