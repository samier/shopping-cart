<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Low Stock Alert</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h1 style="color: #dc3545; margin: 0 0 10px 0;">⚠️ Low Stock Alert</h1>
        <p style="margin: 0; color: #666;">
            @if(count($products) === 1)
                The following product is running low on stock:
            @else
                The following {{ count($products) }} products are running low on stock:
            @endif
        </p>
    </div>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; background-color: #fff; border: 1px solid #dee2e6;">
        <thead>
            <tr style="background-color: #f8f9fa;">
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6; font-weight: bold;">Product Name</th>
                <th style="padding: 12px; text-align: right; border-bottom: 2px solid #dee2e6; font-weight: bold;">Current Stock</th>
            </tr>
        </thead>
        <tbody>
            @foreach($products as $product)
            <tr style="border-bottom: 1px solid #dee2e6;">
                <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">
                    <strong>{{ $product->name }}</strong>
                </td>
                <td style="padding: 12px; text-align: right; border-bottom: 1px solid #dee2e6; color: #dc3545; font-weight: bold;">
                    {{ $product->stock_quantity }}
                </td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div style="background-color: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
        <p style="margin: 0; color: #856404;">
            <strong>⚠️ Action Required:</strong> Please consider restocking these products soon to avoid stockouts.
        </p>
    </div>

    <div style="text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
        <p style="margin: 0;">This is an automated notification from your shopping cart system.</p>
    </div>
</body>
</html>
