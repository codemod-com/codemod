import java.util.ArrayList;
import java.util.List;
import java.util.HashMap;
import java.util.Map;

public class LegacyCollectionExample {
    
    public void processItems() {
        List<String> items = new ArrayList<>();
        items.add("apple");
        items.add("banana");
        items.add("cherry");
        
        // Old style iteration and filtering
        List<String> filteredItems = new ArrayList<>();
        for (String item : items) {
            if (item.startsWith("a")) {
                filteredItems.add(item.toUpperCase());
            }
        }
        
        // Old style mapping
        List<Integer> lengths = new ArrayList<>();
        for (String item : items) {
            lengths.add(item.length());
        }
        
        // Old style aggregation
        int total = 0;
        for (Integer length : lengths) {
            total += length;
        }
        
        // Already using modern style
        items.stream()
            .filter(s -> s.contains("a"))
            .forEach(System.out::println);
    }
    
    public void handleMap() {
        Map<String, Integer> scores = new HashMap<>();
        scores.put("Alice", 95);
        scores.put("Bob", 80);
        scores.put("Charlie", 90);
        
        // Old style map iteration
        for (Map.Entry<String, Integer> entry : scores.entrySet()) {
            if (entry.getValue() > 85) {
                System.out.println(entry.getKey() + " is a top student");
            }
        }
    }
}
