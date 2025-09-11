import 'package:events_map/main.dart';
import 'package:flutter_test/flutter_test.dart';
// This is a basic Flutter widget test.
//
// To perform an interaction with a widget in your test, use the WidgetTester
// utility in the flutter_test package. For example, you can send tap and scroll
// gestures. You can also use WidgetTester to find child widgets in the widget
// tree, read text, and verify that the values of widget properties are correct.

void main() {
  testWidgets('EventsMapApp smoke test', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const EventsMapApp());

    // Verify that our app starts with the map screen
    expect(find.text('Eventos en Google Maps'), findsOneWidget);
  });
}
